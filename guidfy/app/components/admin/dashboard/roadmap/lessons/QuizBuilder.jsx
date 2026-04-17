'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  HelpCircle, Plus, Trash2, Edit2, Check, X,
  Clock, Target, Save, ChevronDown, ChevronUp,
  CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useLessons } from '@/app/hooks/useLesson';
import { toast } from 'react-toastify';

// ─── Option Row ────────────────────────────────────────
const OptionRow = ({ option, index, onChange, onDelete, canDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
      option.isCorrect
        ? 'border-green-300 bg-green-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    {/* Correct toggle */}
    <button
      type="button"
      onClick={() => onChange(index, 'isCorrect', !option.isCorrect)}
      className="flex-shrink-0"
    >
      {option.isCorrect
        ? <CheckCircle2 size={20} className="text-green-500" />
        : <Circle       size={20} className="text-gray-300 hover:text-gray-400" />
      }
    </button>

    {/* Text */}
    <input
      value={option.text}
      onChange={(e) => onChange(index, 'text', e.target.value)}
      placeholder={`Option ${index + 1}`}
      className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
    />

    {/* Delete */}
    {canDelete && (
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    )}
  </motion.div>
);

// ─── Question Card ─────────────────────────────────────
const QuestionCard = ({ question, index, onEdit, onDelete, saving }) => {
  const [expanded, setExpanded] = useState(false);
  const correctOption = question.options?.find((o) => o.isCorrect);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <p className="flex-1 text-sm font-medium text-gray-800 line-clamp-1">{question.question}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {question.options?.length || 0} options
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onEdit(question); }}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit2 size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            disabled={saving}
          >
            <Trash2 size={14} />
          </motion.button>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2"
          >
            {question.options?.map((opt) => (
              <div
                key={opt.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                  opt.isCorrect
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                {opt.isCorrect
                  ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  : <Circle       size={14} className="text-gray-300 flex-shrink-0" />
                }
                {opt.text}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Question Form (Add / Edit) ────────────────────────
const QuestionForm = ({ initial, onSave, onCancel, saving }) => {
  const emptyOption = () => ({ text: '', isCorrect: false });

  const [questionText, setQuestionText] = useState(initial?.question || '');
  const [options, setOptions] = useState(
    initial?.options?.length >= 2
      ? initial.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
      : [emptyOption(), emptyOption()]
  );
  const [localError, setLocalError] = useState('');

  const handleOptionChange = (idx, field, val) => {
    setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, [field]: val } : o));
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, emptyOption()]);
  };

  const handleDeleteOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!questionText.trim()) { setLocalError('Question text is required'); return; }
    if (options.length < 2)   { setLocalError('At least 2 options are required'); return; }
    if (options.some((o) => !o.text.trim())) { setLocalError('All options must have text'); return; }
    if (!options.some((o) => o.isCorrect))   { setLocalError('Mark at least one correct option'); return; }
    setLocalError('');
    onSave({ question: questionText, options });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 space-y-4"
    >
      {/* Question Text */}
      <div>
        <label className="block text-xs font-semibold text-indigo-700 mb-1.5 uppercase tracking-wide">
          Question
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question..."
          rows={2}
          className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            Answer Options
            <span className="ml-1 text-indigo-400 font-normal normal-case">(click ○ to mark correct)</span>
          </label>
          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add option
            </button>
          )}
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {options.map((opt, idx) => (
              <OptionRow
                key={idx}
                option={opt}
                index={idx}
                onChange={handleOptionChange}
                onDelete={handleDeleteOption}
                canDelete={options.length > 2}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Error */}
      {localError && (
        <div className="flex items-center gap-2 text-red-600 text-xs">
          <AlertCircle size={13} />
          {localError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="gap-1"
        >
          <X size={14} /> Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="gap-1"
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Check size={14} />
          }
          {initial ? 'Save Changes' : 'Add Question'}
        </Button>
      </div>
    </motion.div>
  );
};

// ─── Main QuizBuilder ──────────────────────────────────
const QuizBuilder = ({ isOpen, onClose, lessonId, quizId: propQuizId }) => {
  const {
    currentQuiz,
    quizLoading,
    fetchQuizByLessonId,
    fetchQuizById,
    editQuizSettings,
    addQuizQuestion,
    editQuizQuestion,
    removeQuizQuestion,
  } = useLessons();

  // Settings
  const [settings, setSettings]     = useState({ title: '', timeLimit: '', passingScore: 60 });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Question management
  const [showAddForm,     setShowAddForm]     = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // question object

  // Load quiz on open
  useEffect(() => {
    if (!isOpen) return;
    if (lessonId) fetchQuizByLessonId(lessonId).catch(() => {});
    else if (propQuizId) fetchQuizById(propQuizId).catch(() => {});
  }, [isOpen, lessonId, propQuizId]);

  // Sync settings from quiz
  useEffect(() => {
    if (currentQuiz) {
      setSettings({
        title:        currentQuiz.title        || '',
        timeLimit:    currentQuiz.timeLimit    ?? '',
        passingScore: currentQuiz.passingScore ?? 60,
      });
    }
  }, [currentQuiz]);

  const handleSaveSettings = async () => {
    if (!currentQuiz?.id) return;
    try {
      await editQuizSettings(currentQuiz.id, {
        title:        settings.title,
        timeLimit:    settings.timeLimit ? Number(settings.timeLimit) : null,
        passingScore: Number(settings.passingScore),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
      toast.success('Quiz settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const handleAddQuestion = async (data) => {
    if (!currentQuiz?.id) return;
    try {
      await addQuizQuestion(currentQuiz.id, data);
      setShowAddForm(false);
      toast.success('Question added!');
    } catch {
      toast.error('Failed to add question');
    }
  };

  const handleEditQuestion = async (data) => {
    if (!editingQuestion) return;
    try {
      await editQuizQuestion(editingQuestion.id, data);
      setEditingQuestion(null);
      toast.success('Question updated!');
    } catch {
      toast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Delete this question?')) return;
    try {
      await removeQuizQuestion(questionId);
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const questions = currentQuiz?.questions || [];

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
            <HelpCircle size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-800">Quiz Builder</span>
            {currentQuiz && (
              <p className="text-xs text-gray-400 font-normal">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      }
      containerClassName="max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border border-gray-100"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <div className="p-1 sm:p-2 space-y-5 max-h-[75vh] overflow-y-auto">

        {/* Loading */}
        {quizLoading && questions.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {/* ── Settings ───────────────────────────────── */}
        {currentQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-4 border border-indigo-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Target size={15} className="text-indigo-500" /> Quiz Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs text-gray-500 mb-1">Quiz Title</label>
                <input
                  value={settings.title}
                  onChange={(e) => setSettings((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Quiz title..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock size={11} /> Time Limit (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.timeLimit}
                  onChange={(e) => setSettings((p) => ({ ...p, timeLimit: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="No limit"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Target size={11} /> Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passingScore}
                  onChange={(e) => setSettings((p) => ({ ...p, passingScore: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant={settingsSaved ? 'success' : 'outline'}
                size="sm"
                onClick={handleSaveSettings}
                disabled={quizLoading}
                className="gap-1.5"
              >
                {settingsSaved
                  ? <><CheckCircle2 size={14} /> Saved!</>
                  : <><Save size={14} /> Save Settings</>
                }
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Questions List ──────────────────────────── */}
        {currentQuiz && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <HelpCircle size={15} className="text-indigo-500" />
                Questions
                {questions.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {questions.length}
                  </span>
                )}
              </h3>
              {!showAddForm && !editingQuestion && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus size={13} /> Add Question
                </motion.button>
              )}
            </div>

            {/* Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <QuestionForm
                  onSave={handleAddQuestion}
                  onCancel={() => setShowAddForm(false)}
                  saving={quizLoading}
                />
              )}
            </AnimatePresence>

            {/* Questions */}
            <AnimatePresence>
              {questions.map((q, i) => (
                editingQuestion?.id === q.id
                  ? (
                    <QuestionForm
                      key={q.id}
                      initial={q}
                      onSave={handleEditQuestion}
                      onCancel={() => setEditingQuestion(null)}
                      saving={quizLoading}
                    />
                  )
                  : (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      onEdit={setEditingQuestion}
                      onDelete={handleDeleteQuestion}
                      saving={quizLoading}
                    />
                  )
              ))}
            </AnimatePresence>

            {/* Empty */}
            {questions.length === 0 && !showAddForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
              >
                <HelpCircle size={36} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No questions yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Add your first question →
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Done button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="primary" onClick={onClose} className="gap-2">
            <CheckCircle2 size={16} /> Done
          </Button>
        </div>
      </div>
    </Modal>,
    document.body
  );
};

export default QuizBuilder;