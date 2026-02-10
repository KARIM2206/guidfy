// app/components/OverviewStats.tsx
"use client";

import { motion } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Map, 
  Users,
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';
import OverviewCard from './OverviewCard';

export default function OverviewStats() {
  const stats = [
    {
      id: 1,
      title: "Total Articles",
      value: "1,248",
      change: "+12%",
      isPositive: true,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      description: "Educational articles",
      additionalInfo: "Last updated: Today",
      trendIcon: TrendingUp,
      metric: "This month",
      delay: 0.1
    },
    {
      id: 2,
      title: "Total Courses",
      value: "156",
      change: "+8%",
      isPositive: true,
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      description: "Learning courses",
      additionalInfo: "24 new this quarter",
      trendIcon: Target,
      metric: "Completion rate: 78%",
      delay: 0.2
    },
    {
      id: 3,
      title: "Total Roadmaps",
      value: "42",
      change: "+5%",
      isPositive: true,
      icon: Map,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      description: "Learning paths",
      additionalInfo: "Average duration: 6 months",
      trendIcon: Clock,
      metric: "Active learners: 2.4k",
      delay: 0.3
    },
    {
      id: 4,
      title: "Total Students",
      value: "15,827",
      change: "+15%",
      isPositive: true,
      icon: Users,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      description: "Active learners",
      additionalInfo: "From 120+ countries",
      trendIcon: Award,
      metric: "Satisfaction: 94%",
      delay: 0.4
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <section className="py-6 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Educational Overview
        </h2>
        <p className="text-gray-600 mt-2">
          Statistics for our non-profit learning platform
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            variants={cardVariants}
            whileHover="hover"
            custom={stat.delay}
          >
            <OverviewCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              isPositive={stat.isPositive}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              description={stat.description}
              additionalInfo={stat.additionalInfo}
              trendIcon={stat.trendIcon}
              metric={stat.metric}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Animated Dots Background Effect */}
      <div className="relative mt-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-200 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}