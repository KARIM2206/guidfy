const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf-8');

const fixes = {
  'userbadge\\[\\]': 'UserBadge[]',
  'communityquestion\\[\\]': 'CommunityQuestion[]',
  'communityquestion @': 'CommunityQuestion @',
  'communityanswer\\[\\]': 'CommunityAnswer[]',
  'learningpathrecommendation\\[\\]': 'LearningPathRecommendation[]',
  'userlessonprogress\\[\\]': 'UserLessonProgress[]',
  'postcomment\\[\\]': 'PostComment[]',
  'projectassignment\\[\\]': 'ProjectAssignment[]',
  'learningpathroadmap\\[\\]': 'LearningPathRoadmap[]',
  'userroadmapprogress\\[\\]': 'UserRoadmapProgress[]'
};

for (const [lower, pascal] of Object.entries(fixes)) {
  schema = schema.replace(new RegExp(lower, 'g'), pascal);
}

fs.writeFileSync(schemaPath, schema);
console.log('Fixed types!');
