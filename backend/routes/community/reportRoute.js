
const router = require('express').Router();
const { createReport, getMyReports } = require('../../controllers/community/report.controller');
const { protect }  = require('../../middleware/authMiddleware');
const checkUser    = require('../../middleware/checkUser');

router.use(protect);
router.use(checkUser);

router.post('/',    createReport);
router.get('/mine', getMyReports);

module.exports = router;