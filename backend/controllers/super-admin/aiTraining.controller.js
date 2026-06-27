// backend/controllers/super-admin/aiTraining.controller.js

const aiTrainingService = require('../../services/aiTraining.service');

/**
 * GET /api/super-admin/ai-training/status
 * Returns current model information, feedback stats, and training status.
 */
exports.getTrainingStatus = async (req, res, next) => {
  try {
    const status = await aiTrainingService.getStatus();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/super-admin/ai-training/retrain
 * Triggers the retraining process.
 */
exports.triggerRetrain = async (req, res, next) => {
  try {
    // We need to check if there is pending feedback
    const status = await aiTrainingService.getStatus();
    if (status.feedback.pending <= 0) {
      return res.status(400).json({ success: false, message: 'No new feedback available for retraining.' });
    }

    const adminId = req.user ? req.user.id : 'UnknownAdmin';
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Send an immediate response, but trigger retrain in background? 
    // The requirement says: "Before execution show confirmation dialog", "During execution: Disable button, Show loading spinner", "After completion: Refresh dashboard".
    // Wait, the client expects POST /retrain to start the training. We should respond immediately that training has started, and then the client can poll /status.
    // However, if we await triggerRetrain(), the request might timeout if training takes long.
    // The requirement says: "Trigger the existing npm retrain script", "After retraining starts: Poll the backend every 5 seconds".
    // Therefore, we should trigger it async, and return 202 Accepted. Let's do that.
    
    // Check if already locked inside triggerRetrain, but we can also check here
    if (status.training.status === 'training') {
      return res.status(409).json({ success: false, message: 'Training already in progress.' });
    }

    // Trigger async
    aiTrainingService.triggerRetrain(adminId, ipAddress).catch(err => {
      console.error('Async Retraining Failed:', err);
    });

    res.status(202).json({ success: true, message: 'Retraining started.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/super-admin/ai-training/history
 * Returns the training history list.
 */
exports.getTrainingHistory = async (req, res, next) => {
  try {
    const history = await aiTrainingService.getTrainingHistory();
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/super-admin/ai-training/logs
 * Returns the latest retraining logs.
 */
exports.getTrainingLogs = async (req, res, next) => {
  try {
    const logs = await aiTrainingService.getLogs(100); // last 100 lines
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
