// backend/utils/trainingLock.js

let isTrainingRunning = false;

/**
 * Attempts to acquire the training lock.
 * @returns {boolean} True if successfully acquired, False if already locked.
 */
function acquireLock() {
  if (isTrainingRunning) {
    return false;
  }
  isTrainingRunning = true;
  return true;
}

/**
 * Releases the training lock.
 */
function releaseLock() {
  isTrainingRunning = false;
}

/**
 * Checks if the training is currently running.
 * @returns {boolean}
 */
function isLocked() {
  return isTrainingRunning;
}

module.exports = {
  acquireLock,
  releaseLock,
  isLocked,
};
