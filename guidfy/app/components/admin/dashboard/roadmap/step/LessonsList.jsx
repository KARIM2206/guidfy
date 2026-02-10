"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  GripVertical,
  Filter,
    Trash2,
  Search,
  Calendar,
  Eye,
  Lock,
  Edit2,
  Video,
  FileText,
  HelpCircle,
  Clock,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// EditableLessonRow Component
function EditableLessonRow({ 
  lesson, 
  isDragging = false,
  onEdit,
  onDelete,
  onOpenSettings,
  onUpdate,
  onDragStart,
  onDragEnd 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(lesson.title);
  const [editDuration, setEditDuration] = useState(lesson.duration);
  const [editStatus, setEditStatus] = useState(lesson.status);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'published':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Eye size={14} />,
          label: 'Published'
        };
      case 'draft':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Edit2 size={14} />,
          label: 'Draft'
        };
      case 'locked':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Lock size={14} />,
          label: 'Locked'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle size={14} />,
          label: 'Unknown'
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-blue-600" />;
      case 'article':
        return <FileText size={16} className="text-purple-600" />;
      case 'quiz':
        return <HelpCircle size={16} className="text-orange-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'article': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate({
        ...lesson,
        title: editTitle.trim(),
        duration: editDuration,
        status: editStatus
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(lesson.title);
    setEditDuration(lesson.duration);
    setEditStatus(lesson.status);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    setEditStatus(newStatus);
    if (!isEditing) {
      onUpdate({ ...lesson, status: newStatus });
    }
  };

  const statusConfig = getStatusConfig(isEditing ? editStatus : lesson.status);

  return (
    <Reorder.Item
      value={lesson}
      id={lesson.id}
      dragListener={false}
    >
      <motion.div
        initial={false}
        animate={isDragging ? { 
          scale: 1.02, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderColor: '#60a5fa'
        } : { 
          scale: 1,
          boxShadow: 'none',
          borderColor: '#e5e7eb'
        }}
        className={`relative group bg-white border rounded-xl transition-all duration-200 ${
          isDragging ? 'border-blue-400 shadow-lg z-10' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            {/* Left Section */}
            <div className="flex-1 flex items-start gap-4">
              {/* Drag Handle */}
              <motion.div
                className="cursor-move mt-1"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={onDragStart}
                onMouseUp={onDragEnd}
                onTouchStart={onDragStart}
                onTouchEnd={onDragEnd}
              >
                <GripVertical size={18} className="text-gray-400" />
              </motion.div>

              {/* Order Number */}
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                {lesson.order}
              </div>

              {/* Type Icon */}
              <div className={`p-3 rounded-lg ${getTypeColor(lesson.type)}`}>
                {getTypeIcon(lesson.type)}
              </div>

              {/* Lesson Content */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Lesson title"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <input
                          type="text"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                          placeholder="Duration"
                        />
                      </div>
                      <select
                        value={editStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="locked">Locked</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{lesson.duration}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(lesson.type)}`}>
                            {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lesson Meta */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Created: {lesson.createdAt}</span>
                      </div>
                      {lesson.lastUpdated && (
                        <div className="flex items-center gap-1">
                          <span>•</span>
                          <span>Updated: {lesson.lastUpdated}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 ml-4">
              {isEditing ? (
                <>
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <CheckCircle size={20} />
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <AlertCircle size={20} />
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    onClick={() => onOpenSettings(lesson)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <SettingsIcon />
                  </motion.button>
                  <motion.button
                    onClick={() => onDelete(lesson.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

// Settings Icon Component
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Main LessonsList Component
export default function LessonsList({
  lessons = [],
  onReorder,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onOpenLessonSettings,
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isDragging, setIsDragging] = useState(false);

  // Sample lessons data if none provided
  const defaultLessons = [
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
      lastUpdated: null,
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
    }
  ];

  const displayLessons = lessons.length > 0 ? lessons : defaultLessons;

  const filteredLessons = displayLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lesson.status === filterStatus;
    const matchesType = filterType === 'all' || lesson.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: displayLessons.length,
    published: displayLessons.filter(l => l.status === 'published').length,
    draft: displayLessons.filter(l => l.status === 'draft').length,
    locked: displayLessons.filter(l => l.status === 'locked').length
  };

  const handleReorder = (newOrder) => {
    // Reorder lessons with updated order numbers
    const reorderedLessons = newOrder.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));
    onReorder(reorderedLessons);
  };

  const handleUpdateLesson = (updatedLesson) => {
    onEditLesson(updatedLesson);
  };

  const handleDelete = (lessonId) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      onDeleteLesson(lessonId);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lessons</h2>
            <p className="text-gray-600">Manage and organize your learning content</p>
          </div>
          
          <motion.button
            onClick={onAddLesson}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg"
          >
            <Plus size={20} />
            Add New Lesson
          </motion.button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Lessons</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-green-200 bg-green-50">
            <div className="text-2xl font-bold text-green-700">{stats.published}</div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-yellow-200 bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-700">{stats.draft}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50">
            <div className="text-2xl font-bold text-red-700">{stats.locked}</div>
            <div className="text-sm text-red-600">Locked</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="locked">Locked</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="quiz">Quiz</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <MoreVertical size={20} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredLessons.length > 0 ? (
            <Reorder.Group 
              axis="y" 
              values={filteredLessons} 
              onReorder={handleReorder}
              className="space-y-4"
            >
              {filteredLessons.map((lesson, index) => (
                <EditableLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  isDragging={isDragging}
                  onEdit={() => handleUpdateLesson(lesson)}
                  onDelete={handleDelete}
                  onOpenSettings={onOpenLessonSettings}
                  onUpdate={handleUpdateLesson}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                />
              ))}
            </Reorder.Group>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No lessons found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or add a new lesson</p>
              <motion.button
                onClick={onAddLesson}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg"
              >
                <Plus size={20} className="inline mr-2" />
                Add First Lesson
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            {filteredLessons.length} of {displayLessons.length} lessons shown
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Save Order
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Bulk Actions
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Publish All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}