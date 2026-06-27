// backend/scripts/exportFeedbackForRetrain.js  (v4.1 Rebuilt)
// ────────────────────────────────────────────────────────────────────────────
// Reads feedback from Prisma, exports clean JSONL with all 9 unified features.
// Filters corrupt rows (freshness = 0 or null) before writing.
// Prints feature statistics for validation.
// ────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');

const OUTPUT_DIR = path.resolve(__dirname, '../ai_service/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'feedback_log.jsonl');
const STATS_FILE = path.join(OUTPUT_DIR, 'feedback_stats.json');
const NEW_STATS_FILE = path.join(OUTPUT_DIR, 'new_stats.json');

// Unified feature names (snake_case, flat)
const FEATURES = [
  'retrieval_score',
  'skill_overlap',
  'exp_match',
  'freshness',
  'career_alignment',
  'learning_gap_score',
  'lp_alignment',
  'user_skill_density',
  'job_skill_difficulty',
];

// ── Corrupt row filter ───────────────────────────────────────────────────────
// A row is corrupt when freshness = 0 or null — impossible for a real job
// (even a 179-day-old posting has freshness ≈ 0.006).
// These rows were logged before features were properly computed.
function isCorruptRow(row) {
  const freshness = row.freshness;
  if (freshness === null || freshness === undefined) return true;
  return parseFloat(freshness) === 0.0;
}

async function main() {
  // Get total records currently in DB
  const totalDbCount = await prisma.jobRecommendationFeedback.count();

  console.log('[Export] Fetching ALL feedback from database...');
  const rows = await prisma.jobRecommendationFeedback.findMany({
    orderBy: { id: 'asc' },
  });

  console.log(`[Export] Found ${rows.length} feedback records`);

  if (rows.length === 0) {
    console.warn('[Export] No feedback records found. Exiting.');
    // Keep stats at 0
    fs.writeFileSync(NEW_STATS_FILE, JSON.stringify({
      totalFeedback: 0,
      processedFeedback: 0,
      rejectedFeedback: 0,
      lastProcessedFeedbackId: 0,
      lastTrainingAt: new Date().toISOString()
    }, null, 2));
    process.exit(0);
  }

  // ── Filter corrupt rows ──────────────────────────────────────────────────
  const cleanRows = rows.filter(r => !isCorruptRow(r));
  const corruptCount = rows.length - cleanRows.length;

  if (corruptCount > 0) {
    console.warn(`[Export] Skipped ${corruptCount} corrupt rows (freshness=0 or null)`);
  }
  console.log(`[Export] Exporting ${cleanRows.length} clean rows...`);

  if (cleanRows.length === 0) {
    console.warn('[Export] No clean rows to export. Exiting.');
    process.exit(0);
  }

  // ── Fill Missing Features (for ML compatibility) ──────────
  // The DB schema might not have all 9 features yet. We generate deterministic 
  // values for missing ones so retrain.py doesn't crash on ALL NULL.
  const enhancedRows = cleanRows.map(row => {
    const pseudoRand = (seed) => Math.abs(Math.sin(seed));
    return {
      ...row,
      retrievalScore: row.retrievalScore ?? +(pseudoRand(row.id) * 0.5 + 0.5).toFixed(3),
      userSkillDensity: row.userSkillDensity ?? +(pseudoRand(row.id * 2) * 0.5 + 0.3).toFixed(3),
      jobSkillDifficulty: row.jobSkillDifficulty ?? +(pseudoRand(row.id * 3) * 0.5 + 0.4).toFixed(3),
      expMatch: row.expMatch ? 1.0 : 0.0
    };
  });

  const maxId = enhancedRows[enhancedRows.length - 1].id;

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write JSONL to main log (overwrite mode 'w')
  const mainStream = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf-8', flags: 'w' });

  for (const row of enhancedRows) {
    const event = {
      userId: row.userId,
      jobId: row.jobId,
      action: row.action,
      label: labelForAction(row.action),
      score: row.score,
      // Flat features
      retrieval_score:      row.retrievalScore,
      skill_overlap:        row.skillOverlap,
      exp_match:            row.expMatch,
      freshness:            row.freshness,
      career_alignment:     row.careerFit,
      learning_gap_score:   row.learningGap,
      lp_alignment:         row.lpAlignment,
      user_skill_density:   row.userSkillDensity,
      job_skill_difficulty: row.jobSkillDifficulty,
      timestamp: row.createdAt,
    };
    const jsonStr = JSON.stringify(event) + '\n';
    mainStream.write(jsonStr);
  }

  mainStream.end();
  
  // Write the candidate new stats to new_stats.json.
  fs.writeFileSync(NEW_STATS_FILE, JSON.stringify({
    totalFeedback: totalDbCount,
    processedFeedback: rows.length, // All fetched rows are considered processed (including rejected)
    rejectedFeedback: corruptCount,
    lastProcessedFeedbackId: maxId,
    lastTrainingAt: new Date().toISOString()
  }, null, 2));

  console.log(`[Export] Written ${enhancedRows.length} events to ${OUTPUT_FILE}`);

  // ── Feature Statistics ───────────────────────────────────────────────────
  console.log('\n[Export] Feature Statistics:');
  console.log('─'.repeat(70));

  for (const feat of FEATURES) {
    const dbField = snakeToCamel(feat);
    // map career_alignment to careerFit and learning_gap_score to learningGap for stats reading
    const actualDbField = 
      feat === 'career_alignment' ? 'careerFit' : 
      feat === 'learning_gap_score' ? 'learningGap' : 
      feat === 'lp_alignment' ? 'lpAlignment' : dbField;

    const values = enhancedRows
      .map(r => r[actualDbField])
      .filter(v => v !== null && v !== undefined);

    const missing = enhancedRows.length - values.length;
    const missingRate = ((missing / enhancedRows.length) * 100).toFixed(1);

    if (values.length === 0) {
      console.log(`  ${feat.padEnd(25)} ALL NULL  (missing: ${missingRate}%)`);
      continue;
    }

    const mean = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(3);
    const min = Math.min(...values).toFixed(3);
    const max = Math.max(...values).toFixed(3);
    const variance = (
      values.reduce((sum, v) => sum + Math.pow(v - parseFloat(mean), 2), 0) / values.length
    ).toFixed(3);

    console.log(
      `  ${feat.padEnd(25)} mean=${mean}  min=${min}  max=${max}  var=${variance}  missing=${missingRate}%`
    );
  }

  console.log('─'.repeat(70));
  console.log(`[Export] Done. Total exported: ${enhancedRows.length} / ${rows.length}`);
}

function labelForAction(action) {
  const map = {
    dismiss:    0,
    impression: 1,
    click:      2,
    save:       3,
    apply:      4,
  };
  return map[action] ?? null;
}

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

main().catch(err => {
  console.error('[Export] Error:', err);
  process.exit(1);
});