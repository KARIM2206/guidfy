// backend/routes/super-admin/aiTrainingRoute.js

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const checkUser = require('../../middleware/checkUser');
const allowedTo = require('../../utils/allowedTo');

const {
  getTrainingStatus,
  triggerRetrain,
  getTrainingHistory,
  getTrainingLogs
} = require('../../controllers/super-admin/aiTraining.controller');

// All routes here are protected and restricted to SUPER_ADMIN
router.use(protect, checkUser, allowedTo('SUPER_ADMIN'));

router.get('/status', getTrainingStatus);
router.post('/retrain', triggerRetrain);
router.get('/history', getTrainingHistory);
router.get('/logs', getTrainingLogs);

module.exports = router;
