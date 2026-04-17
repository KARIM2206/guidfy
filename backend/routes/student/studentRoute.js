const router=require('express').Router()
const { getStudentRoadmaps, getStudentRoadmapStepsById, getStudentLessonsByStepId, updateLessonProgress, getStepProgress, getRoadmapProgress, enrollStudentInLearningPath, getUserContent } = require('../../controllers/student/student.controller')
const {protect}=require('../../middleware/authMiddleware')
const checkUser=require('../../middleware/checkUser')


router.get('/roadmaps/title/:title',protect,checkUser,getStudentRoadmaps)
router.get('/steps/roadmap/:roadmapId',protect,checkUser,getStudentRoadmapStepsById)
router.get('/lessons/step/:stepId',protect,checkUser,getStudentLessonsByStepId)
router.get('/steps/:stepId/progress',protect,checkUser,getStepProgress)
router.get('/roadmaps/:roadmapId/progress',protect,checkUser,getRoadmapProgress)
router.put('/lessons/progress',protect,checkUser,updateLessonProgress)
router.post('/enroll',protect,checkUser,enrollStudentInLearningPath)
router.get('/user-content',protect,checkUser,getUserContent)

module.exports=router