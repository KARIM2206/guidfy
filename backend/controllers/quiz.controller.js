// controllers/quizController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ========================
// Get Quiz by Lesson ID
// ========================
const getQuizByLessonId = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId: Number(lessonId) },
      include: {
        questions: {
          include: { options: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Get Quiz by Quiz ID
// ========================
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(id) },
      include: {
        questions: {
          include: { options: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Update Quiz Settings
// ========================
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, timeLimit, passingScore } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: Number(id) },
      data: {
        title:        title        ?? undefined,
        timeLimit:    timeLimit    !== undefined ? Number(timeLimit)    : undefined,
        passingScore: passingScore !== undefined ? Number(passingScore) : undefined,
      },
    });

    res.json({ success: true, data: quiz, message: "Quiz updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Add Question to Quiz
// ========================
const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, options } = req.body;
    // options: [{ text: string, isCorrect: boolean }]

    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: "Question text is required" });
    }
    if (!options || options.length < 2) {
      return res.status(400).json({ success: false, message: "At least 2 options are required" });
    }
    if (!options.some((o) => o.isCorrect)) {
      return res.status(400).json({ success: false, message: "At least one option must be correct" });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        quizId: Number(quizId),
        options: {
          create: options.map((o) => ({
            text:      o.text,
            isCorrect: Boolean(o.isCorrect),
          })),
        },
      },
      include: { options: true },
    });

    res.status(201).json({ success: true, data: newQuestion, message: "Question added" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Update Question
// ========================
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, options } = req.body;

    if (options && !options.some((o) => o.isCorrect)) {
      return res.status(400).json({ success: false, message: "At least one option must be correct" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update question text
      const updatedQ = await tx.question.update({
        where: { id: Number(questionId) },
        data: { question },
      });

      // Replace options
      if (options) {
        await tx.option.deleteMany({ where: { questionId: Number(questionId) } });
        await tx.option.createMany({
          data: options.map((o) => ({
            text:       o.text,
            isCorrect:  Boolean(o.isCorrect),
            questionId: Number(questionId),
          })),
        });
      }

      return tx.question.findUnique({
        where: { id: Number(questionId) },
        include: { options: true },
      });
    });

    res.json({ success: true, data: updated, message: "Question updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Delete Question
// ========================
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    await prisma.question.delete({ where: { id: Number(questionId) } });

    res.json({ success: true, message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Submit Quiz Attempt (Student)
// ========================
const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId }  = req.params;
    const { answers } = req.body;
    // answers: [{ questionId: number, optionId: number }]
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
      include: {
        questions: { include: { options: true } },
      },
    });

    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    if (!answers || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Answers are required" });
    }

    // ── Calculate Score ──────────────────────────────────
    let correct = 0;
    const results = quiz.questions.map((q) => {
      const userAnswer   = answers.find((a) => a.questionId === q.id);
      const correctOption = q.options.find((o) => o.isCorrect);
      const chosenOption  = userAnswer
        ? q.options.find((o) => o.id === userAnswer.optionId)
        : null;

      const isCorrect = chosenOption?.isCorrect === true;
      if (isCorrect) correct++;

      return {
        questionId:      q.id,
        question:        q.question,
        chosenOptionId:  chosenOption?.id   ?? null,
        chosenText:      chosenOption?.text ?? "Not answered",
        correctOptionId: correctOption?.id,
        correctText:     correctOption?.text,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score          = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const passed         = score >= (quiz.passingScore ?? 60);

    // ── Save Attempt ─────────────────────────────────────
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: Number(quizId),
        score,
        passed,
      },
    });

    // ── Update Lesson Progress if passed ─────────────────
    if (passed) {
      const lesson = await prisma.lesson.findUnique({
        where: { quiz: { id: Number(quizId) } },
        select: { id: true },
      }).catch(() => null);

      // findUnique with relation filter — try via quiz
      const quizWithLesson = await prisma.quiz.findUnique({
        where: { id: Number(quizId) },
        select: { lessonId: true },
      });

      if (quizWithLesson?.lessonId) {
        await prisma.userLessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId: quizWithLesson.lessonId } },
          update: { completed: true, completedAt: new Date() },
          create: { userId, lessonId: quizWithLesson.lessonId, completed: true, completedAt: new Date() },
        });
      }
    }

    res.json({
      success: true,
      data: {
        attemptId:      attempt.id,
        score,
        passed,
        correct,
        total:          totalQuestions,
        passingScore:   quiz.passingScore ?? 60,
        results,
      },
      message: passed ? "🎉 Congratulations! You passed!" : "❌ You didn't pass. Try again!",
    });
  } catch (error) {
    console.error("submitQuizAttempt error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Get My Attempts
// ========================
const getMyAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId     = req.user.id;

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: Number(quizId), userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Get All Attempts (Admin)
// ========================
const getAllAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: Number(quizId) },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total:      attempts.length,
      passed:     attempts.filter((a) => a.passed).length,
      failed:     attempts.filter((a) => !a.passed).length,
      avgScore:   attempts.length
        ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
        : 0,
    };

    res.json({ success: true, data: attempts, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuizByLessonId,
  getQuizById,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submitQuizAttempt,
  getMyAttempts,
  getAllAttempts,
};