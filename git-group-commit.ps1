$ErrorActionPreference = "Continue"

Write-Host "1. Committing AI Pipeline..."
git add ai_service/ backend/ai_service/ backend/prisma/seeds/ backend/controllers/super-admin/ backend/routes/super-admin/ backend/services/aiTraining.service.js backend/utils/trainingLock.js backend/nodemon.json guidfy/app/super-admin/dashboard/ai-training/
git commit -m "feat: AI retraining pipeline and python backend"

Write-Host "2. Committing TanStack & State Management..."
git add guidfy/app/CONTEXT/ guidfy/app/hooks/ guidfy/lib/ guidfy/app/providers/ guidfy/package.json guidfy/package-lock.json guidfy/app/layout.js guidfy/app/learning-paths/layout.js guidfy/app/globals.css
git commit -m "refactor: Migrate to TanStack Query and Zustand, clean up Context API"

Write-Host "3. Committing Super Admin Pipeline..."
git add guidfy/app/super-admin/ guidfy/app/components/super-admin/ guidfy/services/superAdmin/ guidfy/services/admin/jobs.js guidfy/services/admin/lesson.js guidfy/services/admin/roadmap.js backend/routes/superAdminCommunity.route.js
git commit -m "feat: Super Admin dashboard enhancements and pipelines"

Write-Host "4. Committing Admin Pipeline..."
git add guidfy/app/components/admin/ backend/routes/adminCommunity.route.js
git commit -m "feat: Admin dashboard components and routing"

Write-Host "5. Committing Community Pipeline..."
git add guidfy/app/components/community/ guidfy/app/community/ guidfy/services/community/ guidfy/services/apiCommunity.js backend/routes/feedbackRoute.js backend/controllers/feedback.controller.js guidfy/services/feedbackService.js
git commit -m "feat: Community and feedback pipelines"

Write-Host "6. Committing Learning Paths & UI..."
git add guidfy/app/components/learning-path/ guidfy/app/learning-paths/ guidfy/app/components/ui/ guidfy/app/components/notification/ guidfy/app/components/profile/ guidfy/services/notification.js guidfy/services/profile.js guidfy/services/apiProfile.js guidfy/services/apiStudent.js guidfy/services/auth.js guidfy/services/chat.js guidfy/services/api.js guidfy/app/login/ guidfy/app/profile/ guidfy/middleware.js
git commit -m "feat: Learning paths, auth, profile, and UI components"

Write-Host "7. Committing Backend Core..."
git add backend/
git commit -m "feat: Backend core, career reports, and scripts"

Write-Host "8. Committing Remaining Files..."
git add .
git commit -m "chore: Miscellaneous updates and remaining files"

Write-Host "Pushing to GitHub..."
git push

Write-Host "Done!"
