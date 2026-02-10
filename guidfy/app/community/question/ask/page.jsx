// app/question/ask/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionForm from '../../../components/community/question/QuestionForm';
import TagSelector from '../../../components/community/question/TagSelector';
import Editor from '../../../components/community/question/Editor';
import PreviewPanel from '../../../components/community/question/PreviewPanel';
import SubmissionGuidelines from '../../../components/community/question/SubmissionGuidelines';
import { 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Sparkles,
  FileText,
  Code2,
  Tag,
  Eye,
  Send
} from 'lucide-react';

export default function AskQuestionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    code: '',
    language: 'javascript',
    isPublic: true,
    notifyReplies: true
  });
  const [validationErrors, setValidationErrors] = useState({});

  const steps = [
    { id: 1, label: 'Question', icon: FileText },
    { id: 2, label: 'Details', icon: Code2 },
    { id: 3, label: 'Tags', icon: Tag },
    { id: 4, label: 'Review', icon: Eye }
  ];

  useEffect(() => {
    // Auto-save to localStorage
    const savedData = localStorage.getItem('draft_question');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_question', JSON.stringify(formData));
  }, [formData]);

  const validateStep = (stepNumber) => {
    const errors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.title.trim()) {
          errors.title = 'Title is required';
        } else if (formData.title.length < 10) {
          errors.title = 'Title must be at least 10 characters';
        } else if (formData.title.length > 150) {
          errors.title = 'Title must be less than 150 characters';
        }
        break;
        
      case 2:
        if (!formData.description.trim()) {
          errors.description = 'Description is required';
        } else if (formData.description.length < 20) {
          errors.description = 'Please provide more details (at least 20 characters)';
        }
        break;
        
      case 3:
        if (formData.tags.length === 0) {
          errors.tags = 'At least one tag is required';
        } else if (formData.tags.length > 5) {
          errors.tags = 'Maximum 5 tags allowed';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step < steps.length) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.removeItem('draft_question');
      router.push('/community/frontend?question=posted');
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleTagSelect = (tag) => {
    if (formData.tags.includes(tag)) {
      handleInputChange('tags', formData.tags.filter(t => t !== tag));
    } else if (formData.tags.length < 5) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <QuestionForm
            title={formData.title}
            description={formData.description}
            onTitleChange={(value) => handleInputChange('title', value)}
            onDescriptionChange={(value) => handleInputChange('description', value)}
            error={validationErrors.title || validationErrors.description}
          />
        );
        
      case 2:
        return (
          <Editor
            content={formData.description}
            code={formData.code}
            language={formData.language}
            onContentChange={(value) => handleInputChange('description', value)}
            onCodeChange={(value) => handleInputChange('code', value)}
            onLanguageChange={(value) => handleInputChange('language', value)}
          />
        );
        
      case 3:
        return (
          <TagSelector
            selectedTags={formData.tags}
            onTagSelect={handleTagSelect}
            error={validationErrors.tags}
          />
        );
        
      case 4:
        return (
          <PreviewPanel
            title={formData.title}
            description={formData.description}
            tags={formData.tags}
            code={formData.code}
            language={formData.language}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </motion.button>
              
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ask a Question
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                <Eye size={16} />
                <span>{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative mb-8">
            <div className="flex justify-between">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isCompleted = stepItem.id < step;
                const isCurrent = stepItem.id === step;
                
                return (
                  <motion.div
                    key={stepItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${isCurrent
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}>
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span className={`text-sm font-medium mt-2 ${isCurrent
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}>
                      {stepItem.label}
                    </span>
                    
                    {/* Step Number */}
                    <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${isCurrent
                        ? 'bg-white text-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      {stepItem.id}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-6 left-12 right-12 h-1 bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {showPreview ? (
                  <PreviewPanel
                    title={formData.title}
                    description={formData.description}
                    tags={formData.tags}
                    code={formData.code}
                    language={formData.language}
                  />
                ) : (
                  renderStepContent()
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreviousStep}
                disabled={step === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${step === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </motion.button>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('draft_question');
                    setFormData({
                      title: '',
                      description: '',
                      tags: [],
                      code: '',
                      language: 'javascript',
                      isPublic: true,
                      notifyReplies: true
                    });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  Clear Draft
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : step === steps.length ? (
                    <>
                      <Send size={16} />
                      <span>Post Question</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowLeft size={16} className="rotate-180" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Sidebar - Guidelines */}
          <div className="lg:col-span-1">
            <SubmissionGuidelines currentStep={step} />
          </div>
        </div>
      </div>
    </div>
  );
}