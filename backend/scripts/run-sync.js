// scripts/run-sync.js
const { syncMissingSkills } = require('../services/skillSyncService');

(async () => {
  console.log("🚀 Manual Sync Triggered...");
  await syncMissingSkills();
  process.exit(0);
})(); 