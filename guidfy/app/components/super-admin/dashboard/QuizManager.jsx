'use client';
import { useState } from 'react';
import { Button, Input, Modal } from '@/app/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';

const QuizManager = ({ quizId, onUpdate }) => {
  const [questions, setQuestions] = useState([]); // would be loaded based on quizId
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({ text: '', options: ['', '', '', ''], correct: 0 });

  const handleSubmit = () => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? { ...questionForm, id: q.id } : q)));
    } else {
      setQuestions([...questions, { ...questionForm, id: Date.now() }]);
    }
    setModalOpen(false);
    if (onUpdate) onUpdate(questions);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Quiz Questions</h3>
        <Button
          onClick={() => {
            setEditingQuestion(null);
            setQuestionForm({ text: '', options: ['', '', '', ''], correct: 0 });
            setModalOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" /> Add Question
        </Button>
      </div>
      {questions.map((q, idx) => (
        <div key={q.id} className="border p-3 rounded mb-2">
          <div className="flex justify-between">
            <p className="font-medium">
              {idx + 1}. {q.text}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditingQuestion(q);
                  setQuestionForm(q);
                  setModalOpen(true);
                }}
              >
                <Edit size={18} />
              </button>
              <button onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <ul className="mt-2 list-disc pl-5">
            {q.options.map((opt, i) => (
              <li key={i} className={i === q.correct ? 'text-green-600 font-medium' : ''}>
                {opt}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingQuestion ? 'Edit Question' : 'Add Question'}>
        <Input
          label="Question Text"
          value={questionForm.text}
          onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
        />
        <div className="space-y-2">
          {questionForm.options.map((opt, i) => (
            <Input
              key={i}
              label={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const newOptions = [...questionForm.options];
                newOptions[i] = e.target.value;
                setQuestionForm({ ...questionForm, options: newOptions });
              }}
            />
          ))}
        </div>
        <Input
          label="Correct Option Index (0-based)"
          type="number"
          min="0"
          max={questionForm.options.length - 1}
          value={questionForm.correct}
          onChange={(e) => setQuestionForm({ ...questionForm, correct: parseInt(e.target.value) })}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default QuizManager;