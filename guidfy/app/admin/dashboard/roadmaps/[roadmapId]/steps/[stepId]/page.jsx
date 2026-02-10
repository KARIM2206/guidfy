"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StepHeader from '../../../../../../components/admin/dashboard/roadmap/step/StepHeader';
import EditableModuleHeader from '../../../../../../components/admin/dashboard/roadmap/step/EditableModuleHeader';
import ModuleStats from '../../../../../../components/admin/dashboard/roadmap/step/ModuleStats';
import LessonsList from '../../../../../../components/admin/dashboard/roadmap/step/LessonsList';
import AddLessonButton from '../../../../../../components/admin/dashboard/roadmap/step/AddLessonButton';
import ModuleFooterActions from '../../../../../../components/admin/dashboard/roadmap/step/ModuleFooterActions';
import { Save, Eye, Download, Share2 } from 'lucide-react';

export default function StepPage() {
  // Module State
  const [module, setModule] = useState({
    id: 1,
    title: "React Hooks Mastery",
    description: "Learn advanced React hooks patterns and best practices for modern web development",
    isPublished: false,
    isExpanded: true,
    lastSaved: "Just now",
    publishedLessons: 3,
    draftLessons: 2,
    totalLessons: 5
  });

  // Lessons State
  const [lessons, setLessons] = useState([
    {
      id: 1,
      order: 1,
      title: "Introduction to React Hooks",
      description: "Learn the basics of React Hooks",
      duration: "45 mins",
      type: "video",
      status: "published",
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-20",
      resources: 5
    },
    {
      id: 2,
      order: 2,
      title: "State Management with useState",
      description: "Master the useState hook",
      duration: "60 mins",
      type: "article",
      status: "draft",
      createdAt: "2024-01-16",
      resources: 3
    },
    {
      id: 3,
      order: 3,
      title: "Quiz: React Fundamentals",
      description: "Test your React knowledge",
      duration: "30 mins",
      type: "quiz",
      status: "locked",
      createdAt: "2024-01-17",
      lastUpdated: "2024-01-18",
      resources: 8
    },
    {
      id: 4,
      order: 4,
      title: "Advanced useEffect Patterns",
      description: "Deep dive into useEffect",
      duration: "75 mins",
      type: "video",
      status: "published",
      createdAt: "2024-01-18",
      lastUpdated: "2024-01-19",
      resources: 6
    },
    {
      id: 5,
      order: 5,
      title: "Custom Hooks Development",
      description: "Build reusable custom hooks",
      duration: "90 mins",
      type: "video",
      status: "published",
      createdAt: "2024-01-19",
      resources: 4
    }
  ]);

  // Optimistic Updates State
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  // Module Stats
  const [moduleStats, setModuleStats] = useState({
    totalLessons: 5,
    publishedLessons: 3,
    draftLessons: 1,
    lockedLessons: 1,
    totalDuration: "5 hours",
    averageCompletion: 78,
    enrolledStudents: 2450,
    lastUpdated: "2024-01-20"
  });

  // Update stats when lessons change
  useEffect(() => {
    const totalLessons = lessons.length;
    const publishedLessons = lessons.filter(l => l.status === 'published').length;
    const draftLessons = lessons.filter(l => l.status === 'draft').length;
    const lockedLessons = lessons.filter(l => l.status === 'locked').length;

    setModuleStats(prev => ({
      ...prev,
      totalLessons,
      publishedLessons,
      draftLessons,
      lockedLessons
    }));

    setModule(prev => ({
      ...prev,
      totalLessons,
      publishedLessons,
      draftLessons
    }));
  }, [lessons]);

  // Module Header Handlers
  const handleUpdateModule = (updatedData) => {
    setModule(prev => ({
      ...prev,
      ...updatedData,
      lastSaved: 'Saving...'
    }));

    // Simulate API call
    setTimeout(() => {
      setModule(prev => ({
        ...prev,
        lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }, 500);
  };

  const handleToggleExpand = () => {
    setModule(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  // Lessons Handlers
  const handleReorderLessons = (newOrder) => {
    setLessons(newOrder);
    autoSave();
  };

  const handleAddLesson = (newLesson) => {
    // Optimistic update
    const optimisticLesson = {
      ...newLesson,
      isOptimistic: true
    };
    
    setLessons(prev => [...prev, optimisticLesson]);
    
    // Simulate API call
    setTimeout(() => {
      setLessons(prev => 
        prev.map(lesson => 
          lesson.isOptimistic ? { ...lesson, isOptimistic: false } : lesson
        )
      );
      autoSave();
    }, 1000);
  };

  const handleEditLesson = (updatedLesson) => {
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      )
    );
    autoSave();
  };

  const handleDeleteLesson = (lessonId) => {
    // Optimistic update
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
    autoSave();
  };

  const handleOpenLessonSettings = (lesson) => {
    console.log('Open settings for:', lesson);
    // Open lesson settings modal
  };

  // Auto-save function
  const autoSave = () => {
    if (!isSaving) {
      setIsSaving(true);
      setSaveStatus('saving');
      
      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        setSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 1000);
    }
  };

  // Footer Actions Handlers
  const handleSave = () => {
    setSaveStatus('saving');
    setIsSaving(true);
    
    // Simulate API save
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('saved');
      setModule(prev => ({ 
        ...prev, 
        lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handlePublish = () => {
    setModule(prev => ({ ...prev, isPublished: true }));
    autoSave();
  };

  const handleUnpublish = () => {
    setModule(prev => ({ ...prev, isPublished: false }));
    autoSave();
  };

  const handleDeleteModule = () => {
    if (confirm('Are you sure you want to delete this module?')) {
      console.log('Deleting module:', module.id);
      // Navigate back or show success message
    }
  };

  const handleDuplicateModule = () => {
    console.log('Duplicating module:', module.id);
  };

  const handleExportModule = () => {
    console.log('Exporting module:', module.id);
  };

  const handleShareModule = () => {
    console.log('Sharing module:', module.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Page Header */}
      <StepHeader
        step={{
          id: module.id,
          title: module.title,
          description: module.description,
          status: module.isPublished ? 'published' : 'draft',
          category: "Web Development",
          estimatedDuration: "6 weeks",
          enrolledStudents: 2450,
          lastUpdated: "2024-01-20",
          difficulty: "intermediate"
        }}
        roadmapTitle="Full-Stack Web Development"
        roadmapId={123}
        onEdit={() => console.log('Edit step')}
        onPreview={() => console.log('Preview as student')}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Module Header */}
        <EditableModuleHeader
          module={{
            ...module,
            lessonCount: lessons.length,
            progress: 65,
            duration: "6 weeks",
            enrolled: 2450,
            category: "Web Development",
            difficulty: "intermediate"
          }}
          onUpdate={handleUpdateModule}
          onToggleExpand={handleToggleExpand}
        />

        {/* Module Stats */}
        <div className="mb-8">
          <ModuleStats stats={moduleStats} />
        </div>

        {/* Lessons List */}
        {module.isExpanded && (
          <>
            <div className="mb-8">
              <LessonsList
                lessons={lessons}
                onReorder={handleReorderLessons}
                onAddLesson={handleAddLesson}
                onEditLesson={handleEditLesson}
                onDeleteLesson={handleDeleteLesson}
                onOpenLessonSettings={handleOpenLessonSettings}
              />
            </div>

            {/* Add Lesson Button */}
            <div className="mb-8">
              <AddLessonButton
                onAddLesson={handleAddLesson}
                moduleId={module.id}
                nextOrder={lessons.length + 1}
              />
            </div>
          </>
        )}

        {/* Save Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              />
            )}
            {saveStatus === 'saved' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Save size={14} className="text-white" />
              </motion.div>
            )}
            <span className={`text-sm font-medium ${
              saveStatus === 'saving' ? 'text-blue-600' :
              saveStatus === 'saved' ? 'text-green-600' :
              'text-gray-500'
            }`}>
              {saveStatus === 'saving' ? 'Saving changes...' :
               saveStatus === 'saved' ? 'All changes saved' :
               'No unsaved changes'}
            </span>
            <span className="text-sm text-gray-400">
              • Last saved: {module.lastSaved}
            </span>
          </div>
        </div>

        {/* Module Footer Actions */}
        <ModuleFooterActions
          module={module}
          onSave={handleSave}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={handleDeleteModule}
          onDuplicate={handleDuplicateModule}
          onExport={handleExportModule}
          onShare={handleShareModule}
        />
      </div>
    </div>
  );
}