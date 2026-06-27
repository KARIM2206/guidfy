const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Dictionary of lowercase to PascalCase for all models
const modelMap = {
  'bannedmember': 'BannedMember',
  'community': 'Community',
  'jobrecommendationfeedback': 'JobRecommendationFeedback',
  'adminactionlog': 'AdminActionLog',
  'articlelesson': 'ArticleLesson',
  'badge': 'Badge',
  'chatmessage': 'ChatMessage',
  'communityanswer': 'CommunityAnswer',
  'communityquestion': 'CommunityQuestion',
  'communityreport': 'CommunityReport',
  'job': 'Job',
  'jobapplication': 'JobApplication',
  'jobassignment': 'JobAssignment',
  'learningpath': 'LearningPath',
  'learningpathadmin': 'LearningPathAdmin',
  'learningpathpermission': 'LearningPathPermission',
  'learningpathrecommendation': 'LearningPathRecommendation',
  'learningpathroadmap': 'LearningPathRoadmap',
  'lesson': 'Lesson',
  'notification': 'Notification',
  'option': 'Option',
  'post': 'Post',
  'postcomment': 'PostComment',
  'project': 'Project',
  'projectassignment': 'ProjectAssignment',
  'question': 'Question',
  'quiz': 'Quiz',
  'quizattempt': 'QuizAttempt',
  'report': 'Report',
  'roadmap': 'Roadmap',
  'roadmapassignment': 'RoadmapAssignment',
  'step': 'Step',
  'tag': 'Tag',
  'trackprogress': 'TrackProgress',
  'user': 'User',
  'userbadge': 'UserBadge',
  'userjobweight': 'UserJobWeight',
  'userlearningpath': 'UserLearningPath',
  'userlessonprogress': 'UserLessonProgress',
  'userprojectview': 'UserProjectView',
  'userroadmap': 'UserRoadmap',
  'userroadmapprogress': 'UserRoadmapProgress',
  'userstats': 'UserStats',
  'videolesson': 'VideoLesson',
  'view': 'View',
  'vote': 'Vote'
};

// 1. Rename models: `model communityquestion {` -> `model CommunityQuestion { \n  @@map("communityquestion")`
for (const [lower, pascal] of Object.entries(modelMap)) {
  const modelRegex = new RegExp(`model ${lower} \\{`, 'g');
  schema = schema.replace(modelRegex, `model ${pascal} {\n  @@map("${lower}")`);
}

// 2. Rename field types: `field lowercase` -> `field PascalCase`
// This uses a regex to match field declarations and replace the type if it matches a model name.
for (const [lower, pascal] of Object.entries(modelMap)) {
  // Replace type names (e.g. `user user` -> `user User`, `user user?` -> `user User?`, `user user[]` -> `user User[]`)
  // Look for whitespace, then the lowercase model name, then whitespace or ?, []
  const typeRegex = new RegExp(`(\\s+)${lower}(\\s|\\?|\\[)`, 'g');
  schema = schema.replace(typeRegex, `$1${pascal}$2`);
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema fixed!');
