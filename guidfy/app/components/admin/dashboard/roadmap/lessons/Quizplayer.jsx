'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Clock, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, RotateCcw, Trophy,
} from 'lucide-react';
import { useLessons } from '@/app/hooks/useLesson';
import { toast } from 'react-toastify';

// ─── Timer ────────────────────────────────────────────
const Timer = ({ totalSeconds, onExpire }) => {
  const [seconds, setSeconds] = useState(totalSeconds);

  useEffect(() => {
    if (seconds <= 0) { onExpire(); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const m   = Math.floor(seconds / 60);
  const s   = seconds % 60;
  const pct = (seconds / totalSeconds) * 100;
  const urgent = seconds < 60;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${
      urgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'
    }`}>
      <Clock size={14} />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
};

// ─── Result Screen ─────────────────────────────────────
const ResultScreen = ({ result, onRetry, onClose }) => {
  const { score, passed, correct, total, passingScore, results } = result;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      {/* Score Circle */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className={`inline-flex flex-col items-center justify-center w-36 h-36 rounded-full border-8 ${
            passed
              ? 'border-green-400 bg-green-50'
              : 'border-red-400 bg-red-50'
          }`}
        >
          <span className={`text-4xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {score}%
          </span>
          <span className="text-xs text-gray-500 mt-0.5">{correct}/{total} correct</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          {passed ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Trophy size={20} />
              <span className="font-bold text-lg">You Passed!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-500">
              <XCircle size={20} />
              <span className="font-bold text-lg">Not quite — try again!</span>
            </div>
          )}
          <p className="text-sm text-gray-400 mt-1">Passing score: {passingScore}%</p>
        </motion.div>
      </div>

      {/* Answer Review */}
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {results?.map((r, i) => (
          <motion.div
            key={r.questionId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`p-3 rounded-xl border text-sm ${
              r.isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {r.isCorrect
                ? <CheckCircle2 size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                : <XCircle      size={15} className="text-red-400 mt-0.5 flex-shrink-0"   />
              }
              <div className="min-w-0">
                <p className="font-medium text-gray-700 line-clamp-1">{r.question}</p>
                {!r.isCorrect && (
                  <p className="text-xs text-green-600 mt-0.5">✓ {r.correctText}</p>
                )}
                <p className={`text-xs mt-0.5 ${r.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                  Your answer: {r.chosenText}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        {!passed && (
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={15} /> Try Again
          </button>
        )}
        <button
          onClick={onClose}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
            passed ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {passed ? <><Trophy size={15} /> Continue</> : 'Close'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main QuizPlayer ───────────────────────────────────
const QuizPlayer = ({ quiz, onClose, onPass }) => {
  const { submitQuizAttempt, quizLoading, lastAttemptResult } = useLessons();

  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers,    setAnswers]       = useState({}); // { questionId: optionId }
  const [submitted,  setSubmitted]     = useState(false);
  const [result,     setResult]        = useState(null);

  const questions    = quiz.questions || [];
  const currentQ     = questions[currentIdx];
  const totalQ       = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQ) {
      toast.warning(`Please answer all questions (${answeredCount}/${totalQ} answered)`);
      return;
    }
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId: Number(questionId),
        optionId:   Number(optionId),
      }));
      const res = await submitQuizAttempt(quiz.id, formattedAnswers);
      setResult(res.data);
      setSubmitted(true);
      if (res.data.passed && onPass) onPass();
    } catch {
      toast.error('Failed to submit quiz');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setResult(null);
  };

  if (!currentQ && !submitted) {
    return (
      <div className="text-center py-12">
        <HelpCircle size={40} className="mx-auto text-gray-200 mb-2" />
        <p className="text-gray-400">No questions in this quiz yet.</p>
      </div>
    );
  }

  // Result screen
  if (submitted && result) {
    return <ResultScreen result={result} onRetry={handleRetry} onClose={onClose} />;
  }

  const progress = (answeredCount / totalQ) * 100;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{currentIdx + 1}</span>
          <span>/ {totalQ}</span>
        </div>

        <div className="flex items-center gap-2">
          {quiz.timeLimit && (
            <Timer
              totalSeconds={quiz.timeLimit * 60}
              onExpire={handleSubmit}
            />
          )}
          <span className="text-xs text-gray-400">{answeredCount}/{totalQ} answered</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          className="h-full bg-indigo-500 rounded-full"
          transition={{ type: 'spring', stiffness: 200 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <p className="font-semibold text-gray-800 text-base leading-relaxed">
            {currentQ?.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {currentQ?.options?.map((opt) => {
              const selected = answers[currentQ.id] === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(currentQ.id, opt.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                    {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {opt.text}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {currentIdx < totalQ - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={quizLoading}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            {quizLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>Submit Quiz <CheckCircle2 size={15} /></>
            }
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;