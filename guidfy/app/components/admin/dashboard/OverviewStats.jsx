"use client";

import { Autoplay, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  Map,
  Users,
  TrendingUp,
  Clock,
  Target,
  Award,
  Sparkles,
  GraduationCap,
  Globe,
  Heart,
} from "lucide-react";

import OverviewCard from "./OverviewCard";

export default function OverviewStats() {
  const stats = [
    {
      id: 1,
      title: "Total Articles",
      value: "1,248",
      change: "+12%",
      isPositive: true,
      icon: FileText,
      color: "from-blue-600 to-blue-400",
      bgColor: "bg-gradient-to-br from-blue-50/80 to-blue-100/50",
      description: "Educational articles and resources",
      additionalInfo: "Last updated: Today at 9:00 AM",
      metric: "This month",
    },
    {
      id: 2,
      title: "Total Courses",
      value: "156",
      change: "+8%",
      isPositive: true,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-400",
      bgColor: "bg-gradient-to-br from-blue-50/80 to-cyan-50/50",
      description: "Interactive learning courses",
      additionalInfo: "24 new courses added this quarter",
      metric: "78% completion rate",
    },
    {
      id: 3,
      title: "Total Roadmaps",
      value: "42",
      change: "+5%",
      isPositive: true,
      icon: Map,
      color: "from-blue-500 to-indigo-400",
      bgColor: "bg-gradient-to-br from-blue-50/80 to-indigo-50/50",
      description: "Personalized learning paths",
      additionalInfo: "Average duration: 6 months",
      metric: "2.4k active learners",
    },
    {
      id: 4,
      title: "Total Students",
      value: "15.8k",
      change: "+15%",
      isPositive: true,
      icon: Users,
      color: "from-blue-600 to-purple-400",
      bgColor: "bg-gradient-to-br from-blue-50/80 to-purple-50/50",
      description: "Active learners worldwide",
      additionalInfo: "From 120+ countries",
      metric: "94% satisfaction",
    },
  ];

  return (
    <section className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8  text-center md:text-left"
      >
        <div className="flex items-center justify-center md:justify-start gap-2  mb-3">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-800">
            Educational Overview
          </h2>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
          </motion.div>
        </div>
        <p className="text-gray-600 text-[12px] sm:text-sm md:text-base max-w-2xl mx-auto md:mx-0">
          Real-time statistics and insights from our non-profit learning platform
        </p>
      </motion.div>

      {/* Swiper Container - مع ضبط overflow */}
      <div className="relative w-full">
        <Swiper
          modules={[Pagination, Autoplay, A11y]}
          spaceBetween={16}
          slidesPerView={1}
          autoHeight={false}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 1,
              spaceBetween: 16,

            },
            768: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          // الحيلة: force ألا يتجاوز swiper حدود الحاوية
          style={{ overflow: "hidden" }}
          className=" "
        >
          {stats.map((stat) => (
            <SwiperSlide key={stat.id} className=" ">

             <div className="w-full h-60  min-w-0">

                <OverviewCard {...stat} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Animated Background */}
      <div className="relative mt-8 ">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Dots */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-red-300/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, 5, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        :global(.swiper-pagination-bullet) {
          background: #3b82f6 !important;
          opacity: 0.5;
        }
        :global(.swiper-pagination-bullet-active) {
          opacity: 1;
          background: #3b82f6 !important;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
}