'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2, Video, FileText, HelpCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button'; // adjust import path
import LessonPreviewModal from './LessonPreviewModal';
import { useState } from 'react';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
// Optional: if you have a Badge component, you can use it; otherwise we'll keep the styled span

const typeConfig = {
  VIDEO: {
    icon: <Video size={16} />,
    color: 'bg-blue-100 text-blue-600',
    lightBg: 'bg-blue-50',
  },
  ARTICLE: {
    icon: <FileText size={16} />,
    color: 'bg-green-100 text-green-600',
    lightBg: 'bg-green-50',
  },
  QUIZ: {
    icon: <HelpCircle size={16} />,
    color: 'bg-purple-100 text-purple-600',
    lightBg: 'bg-purple-50',
  },
};

const LessonItem = ({ lesson, onEdit, onDelete }) => {
  const router = useRouter();
  const {user}=useAuth()
const role=user?.role=='ADMIN'
  const typeData = typeConfig[lesson.type] || {};
 const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const truncateTitle = (title) => {
    if (!title) return '';
    return title.length > 30 ? title.slice(0, 30) + '…' : title;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
const handleClosePreviewModal = () => {
  setOpenPreviewModal(false);
}
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 ${typeData.lightBg ? `hover:${typeData.lightBg}` : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left side: icon + content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Type Icon with background */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeData.color} flex items-center justify-center`}>
            {typeData.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title with tooltip */}
            <div className="relative group/title w-fit max-w-full">
              <h6 className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                {truncateTitle(lesson.title)}
              </h6>
              {lesson.title?.length > 30 && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover/title:block bg-gray-900 text-white text-xs px-3 py-2 rounded-md shadow-lg z-50 whitespace-normal max-w-xs">
                  {lesson.title}
                </div>
              )}
            </div>

            {/* Description */}
            {lesson.description && (
              <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-1">
                {lesson.description}
              </p>
            )}

            {/* Meta: created date + type badge (visible on mobile) */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                {formatDate(lesson.createdAt)}
              </span>
              {/* Type badge - visible on small screens, hidden on sm+ (already shown in header) */}
              <span className={`sm:hidden text-xs px-2 py-0.5 rounded-full ${typeData.color}`}>
                {lesson.type}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: type badge (desktop) + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
          {/* Type badge - hidden on mobile, visible on sm+ */}
          <span className={`hidden sm:inline-block text-xs px-3 py-1 rounded-full ${typeData.color}`}>
            {lesson.type}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenPreviewModal(true)}
              className="gap-1 !px-2 !py-1 text-xs"
              leftIcon={<Eye size={14} />}
            >
              View
            </Button>
     { role&&  <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(lesson)}
              className="gap-1 !px-2 !py-1 text-xs text-blue-600 hover:bg-blue-50"
              leftIcon={<Edit size={14} />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(lesson.id)}
              className="gap-1 !px-2 !py-1 text-xs text-red-600 hover:bg-red-50"
              leftIcon={<Trash2 size={14} />}
            >
              Delete
            </Button>
         </> }</div>
        </div>
        <LessonPreviewModal
  isOpen={openPreviewModal}
  onClose={handleClosePreviewModal}
  lesson={lesson}
/>
      </div>
    </motion.div>
  );
};

export default LessonItem;