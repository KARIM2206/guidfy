'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Briefcase,
  FolderKanban,
  Layers,
  Calendar,
  Award,
  PlayCircle,
  ChevronRight,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useLearningPaths } from '@/app/hooks/useLearningPath';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/CONTEXT/AuthProvider';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  hover: {
    scale: 1.02,
    boxShadow:
      '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
};

// خلفية متدرجة احترافية عند التحويم
const gradientHoverEffect = {
  whileHover: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
    transition: { duration: 0.2 },
  },
};

export default function LearningCard({ path }) {
  const {
    id,
    title,
    description,
    estimatedDuration,
    jobs,
    projects,
    roadmaps,
    createdAt,
    isPublished,
    progress = 4,
    
    image,
    // حقول جديدة للتجربة
    enrolledStudents = 0,
    averageProgress = 0,
  } = path;
  const{user}=useAuth()
const isEnrolled = path?.enrollments?.some(
  enrollment => enrollment.userId === Number(user?.id)
);
const { enrollLearningPathToStudent }=useLearningPaths();
console.log(typeof enrollStudentInLearningPath);
  
const handleButtonClick=async () => {
      if(!isEnrolled){
     await enrollLearningPathToStudent(id);
      router.push(`/learning-paths/${title}`);
      }
      else{
        router.push(`/learning-paths/${title}`);
      }
    }
const router=useRouter();
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const buttonText = isEnrolled
    ? progress > 0
      ? 'Continue Learning'
      : 'Start Learning'
    : 'Start Learning';


  return (
<div>
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        {...gradientHoverEffect}
        className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 cursor-pointer relative"
      >
        {/* صورة مصغرة */}
        {image && (
          <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Image
                src={`http://localhost:8000${image}`}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized
              />
            </motion.div>
          </div>
        )}

        {/* الرأس: العنوان + شارات الحالة */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>
            {isEnrolled && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Award size={12} />
                Enrolled
              </span>
            )}
          </div>
        </div>

        {/* الوصف */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {description}
        </p>

        {/* إحصائيات المسار */}
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Layers size={14} />
            {roadmaps?.length || 0} Roadmaps
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban size={14} />
            {projects?.length || 0} Projects
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={14} />
            {jobs || 0} Jobs
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            {estimatedDuration} hrs
          </div>
        </div>

        {/* إحصائيات الطلاب (جديدة) */}
        {(enrolledStudents > 0 || averageProgress > 0) && (
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            {enrolledStudents > 0 && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{enrolledStudents} students</span>
              </div>
            )}
            {averageProgress > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp size={14} />
                <span>{averageProgress}% avg. progress</span>
              </div>
            )}
          </div>
        )}

        {/* شريط التقدم (للمستخدم الحالي) */}
        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Your progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-600 h-1.5 rounded-full"
              />
            </div>
          </div>
        )}

        {/* التذييل: التاريخ + زر البدء */}
        <div className="flex items-center justify-between border-t pt-3">
          {formattedDate && (
            <div className="flex items-center text-xs text-gray-400">
              <Calendar size={14} className="mr-1" />
              {formattedDate}
            </div>
          )}
           <motion.a
           href={`/learning-paths/${title}`}

           onClick={handleButtonClick}
    whileHover={{ scale: 1.05, x: 3 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
  >
    {buttonText}
    <ChevronRight size={16} />
  </motion.a>
        </div>
      </motion.div>
    </div>
  );
}