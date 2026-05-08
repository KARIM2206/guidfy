const router = require('express').Router();

const allowedTo = require('../../utils/allowedTo');
const { protect } = require('../../middleware/authMiddleware');
const checkUser = require('../../middleware/checkUser');
const {
  createJob,
  getAllJobsToCreatedByAdmin,
  getSingleJob,
  updateJob,
  deleteJob,
  getAlljobs,
  changeStatus,
  getAlljobsToStudentByLearningPathTitle
} = require('../../controllers/admin/jobs.controlers');
// const { fetchJobsFromN8N } = require('../../services/job.service');
const { getJobs , fetchJobsFromN8N } = require('../../controllers/N8n.controller');

// CREATE
router.post('/', protect, checkUser, allowedTo('ADMIN'), createJob);

// READ
router.get('/all/student/learning-path/:learningPathId', protect, checkUser, getJobs);
router.get("/fetch-from-n8n",protect, checkUser, fetchJobsFromN8N);
router.get('/all', protect, checkUser, allowedTo('SUPER_ADMIN','ADMIN'), getAlljobs);

router.get('/', protect, checkUser, getAllJobsToCreatedByAdmin);
router.get('/:id', protect, checkUser, getSingleJob);

// UPDATE
router.put('/status/:id', protect, checkUser, allowedTo('SUPER_ADMIN','ADMIN'), changeStatus); // ⚡ لازم قبل /:id
router.put('/:id', protect, checkUser, allowedTo('ADMIN','SUPER_ADMIN'), updateJob);

// DELETE
router.delete('/:id', protect, checkUser, allowedTo('ADMIN','SUPER_ADMIN'), deleteJob);

module.exports = router;