'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, AlignLeft, Hash, Film, Save, X,
  Upload, Trash2, HelpCircle, FileText,
  Globe, HardDrive, ArrowRight,
} from 'lucide-react';
import Modal    from '@/app/components/ui/Modal';
import Input    from '@/app/components/ui/Input';
import Select   from '@/app/components/ui/Select';
import Textarea from '@/app/components/ui/Textarea';
import Button   from '@/app/components/ui/Button';
import { LESSON_TYPE_OPTIONS } from '@/app/utils/constants';
import { useLessons } from '@/app/hooks/useLesson';
import { toast } from 'react-toastify';

// ── QuizBuilder lazy import to avoid circular deps ──
import QuizBuilder from './QuizBuilder';

// ─── Video Field ───────────────────────────────────────
const VideoField = ({
  videoFile, setVideoFile,
  existingVideoUrl, setExistingVideoUrl,
  videoPreview, setVideoPreview,
  isExternal, setIsExternal,
  externalLink, setExternalLink,
  errors, setErrors,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => { if (videoPreview) URL.revokeObjectURL(videoPreview); };
  }, [videoPreview]);

  const handleToggleSource = (value) => {
    setIsExternal(value);
    setVideoFile(null);
    setExistingVideoUrl(null);
    setVideoPreview(null);
    setExternalLink('');
    setErrors((prev) => ({ ...prev, videoFile: null }));
  };

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(URL.createObjectURL(file));
      setExistingVideoUrl(null);
      setErrors((prev) => ({ ...prev, videoFile: null }));
    } else {
      setErrors((prev) => ({ ...prev, videoFile: 'Please select a valid video file' }));
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setExistingVideoUrl(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setExternalLink('');
    setErrors((prev) => ({ ...prev, videoFile: null }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[false, true].map((val) => (
          <motion.button
            key={String(val)}
            type="button"
            onClick={() => handleToggleSource(val)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isExternal === val
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {val ? <><Globe size={14} className="inline mr-1" />External</> : <><HardDrive size={14} className="inline mr-1" />Local</>}
          </motion.button>
        ))}
      </div>

      {isExternal ? (
        <Input
          label="External Video URL"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          placeholder="https://example.com/video.mp4"
          leftIcon={<Film size={18} className="text-gray-400" />}
          error={errors.videoFile}
        />
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video File <span className="text-red-500">*</span>
          </label>
          <motion.div
            whileHover={{ scale: 1.01 }}
            animate={{
              borderColor: isDragging ? '#3b82f6' : videoFile || existingVideoUrl ? '#22c55e' : '#d1d5db',
              backgroundColor: isDragging ? '#eff6ff' : 'white',
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('video-upload').click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-shadow hover:shadow-md"
          >
            <input id="video-upload" type="file" accept="video/*" className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])} />
            {videoPreview || existingVideoUrl ? (
              <div className="relative">
                <video src={videoPreview || existingVideoUrl} controls className="mx-auto max-h-40 rounded-lg shadow-sm" />
                <p className="text-sm text-gray-600 mt-2 truncate max-w-xs mx-auto">
                  {videoFile ? videoFile.name : 'Current video'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={40} className="text-gray-400" />
                <p className="text-gray-600 text-sm">Drag & drop a video here, or click to select</p>
                <p className="text-xs text-gray-400">MP4, WebM, Ogg (max 100MB)</p>
              </div>
            )}
          </motion.div>
          {(videoFile || existingVideoUrl) && (
            <Button type="button" variant="danger" size="sm" onClick={handleRemoveVideo} className="gap-2 mt-3">
              <Trash2 size={16} /> Remove Video
            </Button>
          )}
          {errors.videoFile && <p className="text-red-600 text-sm mt-1">{errors.videoFile}</p>}
        </div>
      )}
    </div>
  );
};

// ─── Article Field ─────────────────────────────────────
const ArticleField = ({ isExternal, setIsExternal, content, setContent, externalLink, setExternalLink, errors }) => {
  const handleToggleSource = (value) => {
    setIsExternal(value);
    if (value) setContent(''); else setExternalLink('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[false, true].map((val) => (
          <motion.button key={String(val)} type="button" onClick={() => handleToggleSource(val)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isExternal === val ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {val ? <><Globe size={14} className="inline mr-1" />External</> : <><HardDrive size={14} className="inline mr-1" />Local</>}
          </motion.button>
        ))}
      </div>
      {!isExternal ? (
        <Textarea label="Article Content" value={content} onChange={(e) => setContent(e.target.value)}
          rows={6} placeholder="Write your article content here..."
          leftIcon={<FileText size={18} className="text-gray-400" />} error={errors.content} required />
      ) : (
        <Input label="External Article URL" value={externalLink} onChange={(e) => setExternalLink(e.target.value)}
          placeholder="https://example.com/article"
          leftIcon={<FileText size={18} className="text-gray-400" />} error={errors.content} />
      )}
    </div>
  );
};

// ─── Main LessonForm ───────────────────────────────────
const LessonForm = ({ isOpen, onClose, stepId, lesson = null }) => {
  const { setRefreshTrigger, editLesson, createLesson } = useLessons();

  const [formData, setFormData] = useState({ title: '', description: '', type: 'VIDEO', order: 0 });
  const [content,          setContent]          = useState('');
  const [videoFile,        setVideoFile]        = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [videoPreview,     setVideoPreview]     = useState(null);
  const [externalLink,     setExternalLink]     = useState('');
  const [isExternal,       setIsExternal]       = useState(false);
  const [errors,           setErrors]           = useState({});
  const [loading,          setLoading]          = useState(false);

  // ✅ Quiz builder state
  const [quizBuilderOpen,  setQuizBuilderOpen]  = useState(false);
  const [createdLessonId,  setCreatedLessonId]  = useState(null); // lessonId بعد الإنشاء

  // Initialize form
  useEffect(() => {
    if (lesson?.id) {
      setFormData({ title: lesson.title || '', description: lesson.description || '', type: lesson.type || 'VIDEO', order: lesson.order || 0 });
      if (lesson.type === 'ARTICLE') {
        setContent(lesson.article?.content || '');
        setIsExternal(lesson.article?.isExternal || false);
        setExternalLink(lesson.article?.isExternal ? lesson.article?.content : '');
        setVideoFile(null); setVideoPreview(null); setExistingVideoUrl(null);
      } else if (lesson.type === 'VIDEO') {
        if (lesson.video?.videoUrl) {
          setExistingVideoUrl(lesson.video.videoUrl);
          setIsExternal(lesson.video?.isExternal || false);
          setExternalLink(lesson.video?.isExternal ? lesson.video.videoUrl : '');
          setContent('');
        }
      }
    } else {
      setFormData({ title: '', description: '', type: 'VIDEO', order: 0 });
      setVideoFile(null); setExistingVideoUrl(null); setVideoPreview(null);
      setContent(''); setExternalLink(''); setIsExternal(false);
    }
    setErrors({});
    setCreatedLessonId(null);
  }, [lesson, isOpen]);

  const handleTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, type: e.target.value }));
    setVideoFile(null); setExistingVideoUrl(null); setVideoPreview(null);
    setExternalLink(''); setIsExternal(false); setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.type)         newErrors.type  = 'Type is required';
    if (formData.type === 'VIDEO')   { if (!videoFile && !existingVideoUrl && !externalLink) newErrors.videoFile = 'Video is required'; }
    if (formData.type === 'ARTICLE') { if (!content && !externalLink) newErrors.content = 'Content is required'; }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (formData.type === 'VIDEO') {
        payload.videoFile    = videoFile;
        payload.externalLink = isExternal ? externalLink : null;
      } else if (formData.type === 'ARTICLE') {
        payload.content      = content;
        payload.externalLink = isExternal ? externalLink : null;
      }

      let response;
      if (lesson?.id) {
        response = await editLesson(lesson.id, payload);
      } else {
        response = await createLesson(stepId, payload);
      }

      if (response?.success) {
        toast.success(lesson?.id ? 'Lesson updated!' : 'Lesson created!');
        setRefreshTrigger((prev) => !prev);

        // ✅ لو QUIZ → افتح QuizBuilder بدل إغلاق الـ modal
        if (formData.type === 'QUIZ' && !lesson?.id) {
          const newLessonId = response?.lesson?.id || response?.data?.id;
          setCreatedLessonId(newLessonId);
          setQuizBuilderOpen(true);
          // مش بنقفل الـ LessonForm — هيتقفل بعد القيز
        } else {
          onClose();
        }
      } else {
        throw new Error(response?.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const fieldVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } } };

  return (
    <>
      {createPortal(
        <Modal
          isOpen={isOpen && !quizBuilderOpen}
          onClose={onClose}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Film size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                {lesson?.id ? 'Edit Lesson' : 'Create New Lesson'}
              </span>
            </div>
          }
          containerClassName="max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border border-gray-100"
          overlayClassName="bg-black/40 backdrop-blur-sm"
        >
          <motion.form
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5 p-1 sm:p-2"
          >
            {/* Title */}
            <motion.div variants={fieldVariants}>
              <Input label="Title" name="title" value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                required placeholder="e.g., Introduction to Algebra"
                leftIcon={<Type size={18} className="text-gray-400" />} error={errors.title} />
            </motion.div>

            {/* Description */}
            <motion.div variants={fieldVariants}>
              <Textarea label="Description (optional)" name="description" value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={2} placeholder="Brief description..." leftIcon={<AlignLeft size={18} className="text-gray-400" />} />
            </motion.div>

            {/* Type */}
            <motion.div variants={fieldVariants}>
              <Select label="Lesson Type" name="type" options={LESSON_TYPE_OPTIONS}
                value={formData.type} onChange={handleTypeChange}
                leftIcon={<Film size={18} className="text-gray-400" />} error={errors.type} />
            </motion.div>

            {/* Type-specific */}
            <AnimatePresence mode="wait">
              <motion.div key={formData.type} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                {formData.type === 'VIDEO' && (
                  <VideoField videoFile={videoFile} setVideoFile={setVideoFile}
                    existingVideoUrl={existingVideoUrl} setExistingVideoUrl={setExistingVideoUrl}
                    videoPreview={videoPreview} setVideoPreview={setVideoPreview}
                    isExternal={isExternal} setIsExternal={setIsExternal}
                    externalLink={externalLink} setExternalLink={setExternalLink}
                    errors={errors} setErrors={setErrors} />
                )}
                {formData.type === 'ARTICLE' && (
                  <ArticleField content={content} setContent={setContent}
                    isExternal={isExternal} setIsExternal={setIsExternal}
                    externalLink={externalLink} setExternalLink={setExternalLink} errors={errors} />
                )}
                {formData.type === 'QUIZ' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100"
                  >
                    <div className="flex items-center gap-3 text-indigo-700">
                      <HelpCircle size={24} />
                      <p className="font-semibold">Quiz Lesson</p>
                    </div>
                    <p className="text-sm text-indigo-600 mt-2">
                      After saving, you'll go to the <strong>Quiz Builder</strong> to add questions and options.
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-indigo-400">
                      <ArrowRight size={12} />
                      Save lesson → Add questions → Set passing score
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Order */}
            <motion.div variants={fieldVariants}>
              <Input label="Order (optional)" name="order" type="number" value={formData.order}
                onChange={(e) => setFormData((p) => ({ ...p, order: e.target.value }))}
                placeholder="Display order" leftIcon={<Hash size={18} className="text-gray-400" />} error={errors.order} />
            </motion.div>

            {/* Actions */}
            <motion.div variants={fieldVariants} className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} className="gap-2 w-full sm:w-auto">
                <X size={18} /> Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}
                className="gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : formData.type === 'QUIZ' && !lesson?.id
                    ? <><Save size={18} /> Save & Build Quiz <ArrowRight size={16} /></>
                    : <><Save size={18} /> Save Lesson</>
                }
              </Button>
            </motion.div>
          </motion.form>
        </Modal>,
        document.body
      )}

      {/* ✅ Quiz Builder يفتح بعد إنشاء الـ QUIZ lesson */}
      {quizBuilderOpen && createdLessonId && (
        <QuizBuilder
          isOpen={quizBuilderOpen}
          onClose={() => {
            setQuizBuilderOpen(false);
            onClose(); // إغلاق الـ LessonForm كمان
          }}
          lessonId={createdLessonId}
        />
      )}
    </>
  );
};

export default LessonForm;