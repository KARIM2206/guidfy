// backend/services/aiTraining.service.js

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { isLocked, acquireLock, releaseLock } = require('../utils/trainingLock');
const prisma = require('../prismaClient');

// Paths
const AI_SERVICE_DIR = path.join(__dirname, '..', 'ai_service');
const MODEL_META_PATH = path.join(AI_SERVICE_DIR, 'models', 'model_meta.json');
const FEEDBACK_LOG_PATH = path.join(AI_SERVICE_DIR, 'data', 'feedback_log.jsonl');
const TRAINING_HISTORY_PATH = path.join(AI_SERVICE_DIR, 'data', 'training_history.json');
const RETRAIN_LOG_PATH = path.join(AI_SERVICE_DIR, 'logs', 'retrain.log');
const AUDIT_LOG_PATH = path.join(AI_SERVICE_DIR, 'logs', 'audit.log');
const FEEDBACK_STATS_PATH = path.join(AI_SERVICE_DIR, 'data', 'feedback_stats.json');

// Ensure log directories exist
async function ensureDirs() {
  const dataDir = path.join(AI_SERVICE_DIR, 'data');
  const logsDir = path.join(AI_SERVICE_DIR, 'logs');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(logsDir, { recursive: true });
}

// Ensure ensureDirs runs once at startup
ensureDirs().catch(console.error);

/**
 * Helper to write to a log file
 */
async function appendToLog(filePath, message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  try {
    await fs.appendFile(filePath, formattedMessage, 'utf-8');
  } catch (error) {
    console.error(`Failed to write to log ${filePath}:`, error);
  }
}

/**
 * Initialize or read feedback stats
 */
async function getFeedbackStats() {
  try {
    const data = await fs.readFile(FEEDBACK_STATS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { processedFeedback: 0, totalFeedback: 0, lastProcessedFeedbackId: 0 };
  }
}

/**
 * Update feedback stats by promoting new_stats.json
 */
async function updateFeedbackStats() {
  const NEW_STATS_PATH = path.join(AI_SERVICE_DIR, 'data', 'new_stats.json');
  try {
    const data = await fs.readFile(NEW_STATS_PATH, 'utf-8');
    await fs.writeFile(FEEDBACK_STATS_PATH, data, 'utf-8');
    await fs.unlink(NEW_STATS_PATH).catch(() => {});
  } catch (error) {
    console.error('Failed to promote new_stats.json:', error);
  }
}

/**
 * Count total feedback entries quickly
 */
async function getTotalFeedbackCount() {
  try {
    return await prisma.jobRecommendationFeedback.count();
  } catch (err) {
    console.error('Error counting feedback:', err);
    return 0;
  }
}

/**
 * Reads training history
 */
async function getTrainingHistory() {
  try {
    const data = await fs.readFile(TRAINING_HISTORY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * Gets the current status of the AI Model and Training
 */
async function getStatus() {
  let modelData = {};
  try {
    const rawMeta = await fs.readFile(MODEL_META_PATH, 'utf-8');
    const meta = JSON.parse(rawMeta);
    const stats = await fs.stat(MODEL_META_PATH);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    
    modelData = {
      version: meta.version || 'v4.1',
      algorithm: 'LambdaMART',
      trainedAt: meta.timestamp || null,
      trainingRows: meta.training_rows || 0,
      modelSize: `${sizeInKB} KB`,
      ndcg_5: meta.ndcg_at_5 !== null ? meta.ndcg_at_5 : null,
      ndcg_10: meta.ndcg_at_10 !== null ? meta.ndcg_at_10 : null,
      map: meta.map_at_10 !== null ? meta.map_at_10 : null,
      mrr: meta.mrr_at_10 !== null ? meta.mrr_at_10 : null,
      evaluation_status: meta.evaluation_status || 'completed',
      evaluation_reason: meta.evaluation_reason || ''
    };
  } catch (err) {
    // Model doesn't exist yet
    modelData = {
      version: 'N/A',
      algorithm: 'LambdaMART',
      trainedAt: null,
      trainingRows: 0,
      modelSize: '0 KB',
      ndcg_5: 0,
      ndcg_10: 0,
      map: 0,
      mrr: 0,
    };
  }

  const totalDbCount = await getTotalFeedbackCount();
  const stats = await getFeedbackStats();
  
  const processedFeedback = stats.processedFeedback || 0;
  const rejectedFeedback = stats.rejectedFeedback || 0;
  const lastFeedback = await prisma.jobRecommendationFeedback.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });

  const pendingFeedback = Math.max(0, totalDbCount - processedFeedback);

  const history = await getTrainingHistory();
  let lastRun = null;
  let lastResult = null;
  let lastDuration = null;

  if (history.length > 0) {
    const latest = history[history.length - 1];
    lastRun = latest.date;
    lastResult = latest.status;
    lastDuration = latest.duration;
  }

  const statusResponse = {
    model: modelData,
    feedback: {
      pending: pendingFeedback,
      processed: processedFeedback,
      rejected: rejectedFeedback,
      total: totalDbCount,
      lastFeedback: lastFeedback ? lastFeedback.createdAt.toISOString() : null,
    },
    training: {
      status: isLocked() ? 'training' : 'idle',
      lastRun: lastRun,
      duration: lastDuration,
      lastResult: lastResult
    }
  };

  return statusResponse;
}

/**
 * Triggers the Retrain Process
 */
async function triggerRetrain(adminId, ipAddress) {
  if (!acquireLock()) {
    throw new Error('Training already in progress.');
  }

  const startTime = Date.now();
  let status = 'failed';
  
  // Get initial feedback count before training
  const totalFeedbackStart = await getTotalFeedbackCount();

  await appendToLog(RETRAIN_LOG_PATH, '=== RETRAINING STARTED ===');
  await appendToLog(RETRAIN_LOG_PATH, `Initiated by Admin: ${adminId}`);

  return new Promise((resolve, reject) => {
    // Execute npm run retrain from the backend directory
    const child = exec('npm run retrain', { cwd: path.join(__dirname, '..') });

    // Capture Output
    child.stdout.on('data', async (data) => {
      await appendToLog(RETRAIN_LOG_PATH, `[STDOUT] ${data.trim()}`);
    });

    child.stderr.on('data', async (data) => {
      await appendToLog(RETRAIN_LOG_PATH, `[STDERR] ${data.trim()}`);
    });

    child.on('close', async (code) => {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const durationSecs = Math.floor(durationMs / 1000);
      const durationFormatted = `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

      try {
        if (code === 0) {
          status = 'success';
          await appendToLog(RETRAIN_LOG_PATH, `=== RETRAINING COMPLETED SUCCESSFULLY in ${durationFormatted} ===`);
          
          // Update processed feedback to what we knew at start of training
          await updateFeedbackStats();
        } else {
          status = 'failed';
          await appendToLog(RETRAIN_LOG_PATH, `=== RETRAINING FAILED with code ${code} in ${durationFormatted} ===`);
        }

        // Get updated metrics if success
        let newMetrics = {};
        if (status === 'success') {
           const rawMeta = await fs.readFile(MODEL_META_PATH, 'utf-8');
           const parsed = JSON.parse(rawMeta);
           newMetrics = {
             ndcg: parsed.ndcg_at_10,
             map: parsed.map_at_10,
             rows: parsed.training_rows
           };
        }

        // Append to training history
        const history = await getTrainingHistory();
        history.push({
          date: new Date().toISOString(),
          duration: durationFormatted,
          rows: newMetrics.rows || 0,
          status: status,
          ndcg: newMetrics.ndcg || 0,
          map: newMetrics.map || 0
        });
        await fs.writeFile(TRAINING_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');

        // Append to audit log
        await appendToLog(AUDIT_LOG_PATH, `Admin ID: ${adminId} | IP: ${ipAddress} | Result: ${status} | Duration: ${durationFormatted}`);

      } catch (postProcessingError) {
        await appendToLog(RETRAIN_LOG_PATH, `Error during post-training updates: ${postProcessingError.message}`);
      } finally {
        releaseLock();
        if (status === 'success') {
          resolve({ status: 'success', duration: durationFormatted });
        } else {
          reject(new Error(`Retraining process exited with code ${code}`));
        }
      }
    });

    child.on('error', async (error) => {
      await appendToLog(RETRAIN_LOG_PATH, `=== RETRAINING ERROR: ${error.message} ===`);
      
      const durationFormatted = '0m 0s';
      
      const history = await getTrainingHistory();
      history.push({
        date: new Date().toISOString(),
        duration: durationFormatted,
        rows: 0,
        status: 'failed',
        ndcg: 0,
        map: 0
      });
      await fs.writeFile(TRAINING_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
      
      await appendToLog(AUDIT_LOG_PATH, `Admin ID: ${adminId} | IP: ${ipAddress} | Result: failed | Duration: ${durationFormatted}`);
      
      releaseLock();
      reject(error);
    });
  });
}

/**
 * Gets the last N lines of the retrain log
 */
async function getLogs(linesCount = 100) {
  try {
    const data = await fs.readFile(RETRAIN_LOG_PATH, 'utf-8');
    const lines = data.split('\n').filter(Boolean);
    return lines.slice(-linesCount);
  } catch (err) {
    return [];
  }
}

module.exports = {
  getStatus,
  triggerRetrain,
  getTrainingHistory,
  getLogs
};
