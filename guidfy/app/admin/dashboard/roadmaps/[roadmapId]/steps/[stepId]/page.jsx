'use client';

import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  Settings,
  Play,
  FileText,
  HelpCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

// TanStack Query Hooks
import { useStepById, useUpdateStep, useDeleteStep } from '@/app/hooks/useStep';
import {
  useLessonsByStep,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/app/hooks/useLesson';

// Components
import Loader from '@/app/components/ui/Loader';
import Button from '@/app/components/ui/Button';
import LessonForm from '@/app/components/admin/dashboard/roadmap/lessons/LessonForm';
import DeleteModal from '@/app/components/admin/dashboard/roadmap/DeleteModel';
import StepForm from '@/app/components/admin/dashboard/roadmap/step/StepForm'; // ✅ المكون الخارجي
import LessonItem from '@/app/components/admin/dashboard/roadmap/lessons/LessonItem';

/* ═══════════════════════════════════════════════════════════
   Lesson Type Badge
   ═══════════════════════════════════════════════════════════ */
function LessonTypeBadge({ type }) {
  const configs = {
    video: { icon: Play, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    article: { icon: FileText, color: 'bg-sky-50 text-sky-700 border-sky-200' },
    quiz: { icon: HelpCircle, color: 'bg-violet-50 text-violet-700 border-violet-200' },
    assignment: { icon: Edit3, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  const config = configs[type] || configs.article;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} backdrop-blur-sm`}>
      <Icon size={12} className="stroke-[2.5]" />
      {type?.charAt(0).toUpperCase() + type?.slice(1)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Lesson Card
   ═══════════════════════════════════════════════════════════ */
function LessonCard({ lesson, index, roadmapId, stepId, onEdit, onDelete, onOpenSettings }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-white rounded-2xl border border-slate-200/60 hover:border-blue-300/80 hover:shadow-lg hover:shadow-blue-100/40 transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 pt-1 select-none">
            <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 transition-all">
              <GripVertical size={18} />
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold font-mono border border-slate-200 shadow-sm">
              {String(lesson.order).padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h4 className="font-semibold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-md text-[15px]">
                <Link
                  href={`/admin/dashboard/roadmaps/${roadmapId}/steps/${stepId}/lessons/${lesson.id}`}
                  className="inline-block hover:text-blue-600 transition-colors truncate"
                >
                  {lesson.title}
                </Link>
              </h4>
              <LessonTypeBadge type={lesson.type} />
            </div>
            <p className="text-sm text-slate-500 line-clamp-1 mb-3 leading-relaxed">{lesson.description}</p>
            
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1 rounded-lg border border-slate-100">
                <Clock size={13} className="text-slate-400" />
                {lesson.duration}
              </span>
              {lesson.resources > 0 && (
                <span className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1 rounded-lg border border-slate-100">
                  <BookOpen size={13} className="text-slate-400" />
                  {lesson.resources} resources
                </span>
              )}
              {lesson.status === 'published' && (
                <span className="flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 text-emerald-600">
                  <CheckCircle size={13} />
                  Published
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 sm:pt-0 sm:border-t-0 bg-slate-50/30 sm:bg-transparent -mx-5 -mb-5 p-3 sm:p-0 sm:m-0">
          <button
            onClick={() => onEdit(lesson)}
            className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-xl transition-all duration-200 flex items-center gap-1.5 text-xs font-medium px-3.5 shadow-sm hover:shadow-md hover:shadow-blue-100/50"
            title="Edit Lesson"
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => onOpenSettings(lesson)}
            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-all duration-200 shadow-sm"
            title="Advanced Settings"
          >
            <Settings size={15} />
          </button>

          <button
            onClick={() => onDelete(lesson.id)}
            className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-xl transition-all duration-200 shadow-sm"
            title="Delete Lesson"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, color, delay }) {
  const colors = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    green: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bg-white rounded-2xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.bg} border ${c.border} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className={`${c.text} stroke-[2]`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-800 tracking-tight mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════ */
export default function StepPage() {
  const { roadmapId, stepId } = useParams();
  const router = useRouter();

  // ─── UI State ───
  const [isExpanded, setIsExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  
  // Delete modal states
  const [deleteLessonModalOpen, setDeleteLessonModalOpen] = useState(false);
  const [lessonIdToDelete, setLessonIdToDelete] = useState(null);
  const [deleteStepModalOpen, setDeleteStepModalOpen] = useState(false);
  
  // ✅ استخدام StepForm الخارجي بدلاً من المودال المدمج
  const [editStepOpen, setEditStepOpen] = useState(false);

  // ─── Queries & Mutations ───
  const { data: stepData, isLoading: stepLoading } = useStepById(stepId);
  const { data: lessonsData, isLoading: lessonsLoading } = useLessonsByStep(stepId);

  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const updateStepMutation = useUpdateStep();
  const deleteStepMutation = useDeleteStep();

  const step = stepData?.data ?? stepData ?? {};
  const lessons = lessonsData ?? [];
  const isMutating = createLessonMutation.isPending || updateLessonMutation.isPending;

  // ✅ use route param roadmapId for links and API actions

  // ─── Stats Derived Data ───
  const stats = useMemo(() => {
    const total = lessons.length;
    const totalDuration = lessons.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0);
    const hours = Math.floor(totalDuration / 60);
    const mins = totalDuration % 60;
    
    return {
      total,
      totalDuration: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      completion: total > 0 ? Math.round((lessons.filter(l => l.status === 'published').length / total) * 100) : 0,
      publishedCount: lessons.filter(l => l.status === 'published').length,
    };
  }, [lessons]);

  // ─── Lesson Handlers ───
  const handleAddLesson = useCallback(async (data) => {
    try {
      setSaveStatus('saving');
      await createLessonMutation.mutateAsync({ ...data, order: lessons.length + 1, stepId });
      setSaveStatus('saved');
      setShowForm(false);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [createLessonMutation, lessons.length, stepId]);

  const handleEditLesson = useCallback(async (data) => {
    if (!editingLesson) return;
    try {
      setSaveStatus('saving');
      await updateLessonMutation.mutateAsync({ id: editingLesson.id, data: { ...data, stepId } });
      setSaveStatus('saved');
      setShowForm(false);
      setEditingLesson(null);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [updateLessonMutation, editingLesson, stepId]);

  const openDeleteLessonConfirmation = useCallback((id) => {
    setLessonIdToDelete(id);
    setDeleteLessonModalOpen(true);
  }, []);

  const handleConfirmDeleteLesson = useCallback(async () => {
    if (!lessonIdToDelete) return;
    try {
      setSaveStatus('saving');
      
      await deleteLessonMutation.mutateAsync(lessonIdToDelete);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLessonIdToDelete(null);
      setDeleteLessonModalOpen(false);
    }
  }, [deleteLessonMutation, lessonIdToDelete]);

  const openEditForm = useCallback((lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  }, []);

  // ─── Step Handlers ───
  const handleEditStep = useCallback(async (data) => {
    try {
      setSaveStatus('saving');
      // ✅ تمرير roadmapId لضمان invalidate الصحيح للـ cache
      await updateStepMutation.mutateAsync({ 
        id: stepId, 
        data: { ...data, roadmapId } 
      });
      setSaveStatus('saved');
      setEditStepOpen(false);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [updateStepMutation, stepId, roadmapId]);

  const handleDeleteStep = useCallback(async () => {
    if (!roadmapId) {
      console.error('RoadmapId not available');
      setSaveStatus('error');
      return;
    }
    try {
      setSaveStatus('saving');
      // ✅ تمرير الـ id و roadmapId معاً للـ API
      await deleteStepMutation.mutateAsync({ id: stepId, roadmapId });
      router.back();
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setDeleteStepModalOpen(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [deleteStepMutation, stepId, roadmapId, router]);

  if (stepLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased pb-12">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white/70 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 shadow-sm shadow-slate-200/20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <button
                onClick={() => router.back()}
                className="p-2.5 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-700 shrink-0 shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">{step.title}</h1>
                  {step.status === 'published' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 uppercase tracking-wider">
                      Published
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate leading-relaxed">{step.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 text-xs h-9 px-4 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                onClick={() => console.log('Preview step', stepId)}
              >
                <Eye size={14} />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-xs h-9 px-4 rounded-xl border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                onClick={() => setEditStepOpen(true)}
              >
                <Edit3 size={14} />
                <span className="hidden sm:inline">Edit Step</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-xs h-9 px-4 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all"
                onClick={() => setDeleteStepModalOpen(true)}
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Total Lessons" value={stats.total} color="blue" delay={0} />
          <StatCard icon={Clock} label="Total Duration" value={stats.totalDuration} color="purple" delay={0.1} />
          <StatCard icon={BarChart3} label="Completion Rate" value={`${stats.completion}%`} color="orange" delay={0.15} />
          <StatCard icon={CheckCircle} label="Published" value={stats.publishedCount} color="green" delay={0.2} />
        </div>

        {/* Module Title Accordion */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <BookOpen size={22} className="stroke-[2.2]" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-slate-900">{step.title || 'Module Folder'}</h2>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {lessons.length} lessons • {stats.totalDuration} • {stats.completion}% completed
                </p>
              </div>
            </div>
            <div className={`p-2 rounded-xl bg-slate-50 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={20} />
            </div>
          </button>
        </motion.div>

        {/* Lessons List */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mb-6">
                <AnimatePresence mode="popLayout">
                  {lessonsLoading ? (
                    <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
                      <Loader2 size={32} className="animate-spin text-blue-600" />
                    </div>
                  ) : lessons.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-700 font-semibold text-sm mb-1">No lessons found</p>
                      <p className="text-slate-400 text-xs">Get started by adding your first lesson</p>
                    </motion.div>
                  ) : (
                    lessons.map((lesson, index) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        roadmapId={roadmapId}
                        stepId={stepId}
                        onEdit={openEditForm}
                        onDelete={openDeleteLessonConfirmation}
                        // onOpenSettings={(l) => console.log('Settings:', l)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setEditingLesson(null); setShowForm(true); }}
                className="w-full flex items-center justify-center gap-2.5 p-4 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 font-semibold text-sm mb-8 shadow-sm hover:shadow-md hover:shadow-blue-100/30"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Plus size={18} className="stroke-[2.5] text-blue-600" />
                </div>
                <span>Add New Lesson</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info & Sync */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div key="sav" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div key="svd" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-emerald-600">
                  <CheckCircle size={18} />
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div key="err" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-rose-600">
                  <AlertCircle size={18} />
                </motion.div>
              )}
              {saveStatus === 'idle' && (
                <motion.div key="idl" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-slate-400">
                  <Sparkles size={18} />
                </motion.div>
              )}
            </AnimatePresence>
            <span className={`text-xs font-semibold ${
              saveStatus === 'saving' ? 'text-blue-600' :
              saveStatus === 'saved' ? 'text-emerald-600' :
              saveStatus === 'error' ? 'text-rose-600' : 'text-slate-400'
            }`}>
              {saveStatus === 'saving' ? 'Saving changes...' :
               saveStatus === 'saved' ? 'All changes saved successfully' :
               saveStatus === 'error' ? 'Something went wrong' : 'All systems operational'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Last updated: {new Date().toLocaleDateString()}</span>
            <Button variant="outline" className="gap-1.5 text-xs h-8 px-3 rounded-xl border-slate-200">
              <Download size={13} /> Export
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Lesson Form Modal */}
      <LessonForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingLesson(null); }}
        onSubmit={editingLesson ? handleEditLesson : handleAddLesson}
        lesson={editingLesson || {}}
        stepId={stepId}
        loading={isMutating}
      />

      {/* Delete Lesson Modal */}
      <DeleteModal
        isOpen={deleteLessonModalOpen}
        onClose={() => { setDeleteLessonModalOpen(false); setLessonIdToDelete(null); }}
        confirmDelete={handleConfirmDeleteLesson}
        itemName="lesson"
      />

      {/* Delete Step Modal */}
      <DeleteModal
        isOpen={deleteStepModalOpen}
        onClose={() => setDeleteStepModalOpen(false)}
        confirmDelete={handleDeleteStep}
        itemName="step"
      />

      {/* ✅ Edit Step Modal - Using external StepForm component */}
      <StepForm
        isOpen={editStepOpen}
        onClose={() => setEditStepOpen(false)}
        onSubmit={handleEditStep}
        initialData={{ 
          id: step.id,
          title: step.title, 
          description: step.description,
          order: step.order 
        }}
        loading={updateStepMutation.isPending}
      />
    </div>
  );
}