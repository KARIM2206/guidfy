"use client";

import { motion } from "framer-motion";
import { 
  Brain, 
  Trophy, 
  Briefcase, 
  Users 
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Guided Tracks",
      desc: "AI-guided tracks tailored to your goals. No more guessing what to learn next.",
      iconStyle: "w-10 h-10 text-blue-500"
    },
    {
      icon: Trophy,
      title: "Impressive Portfolios",
      desc: "Build impressive portfolios that get noticed by top companies and recruiters.",
      iconStyle: "w-10 h-10 text-cyan-400"
    },
    {
      icon: Briefcase,
      title: "Direct Opportunities",
      desc: "Connect directly with opportunities that match your skills and aspirations.",
      iconStyle: "w-10 h-10 text-emerald-400"
    },
    {
      icon: Users,
      title: "Thriving Community",
      desc: "Learn with mentors and peers in dedicated tech communities.",
      iconStyle: "w-10 h-10 text-indigo-400"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
      
      {/* Animated Blobs */}
      <motion.div
        className="absolute top-0 left-0 h-48 w-48 bg-blue-100/40 rounded-full blur-xl opacity-60"
        animate={{
          scale: [1, 1.05, 0.95, 1],
          translateX: [0, 20, 40, 0],
          translateY: [0, -15, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 2,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-0 right-0 h-48 w-48 bg-cyan-100/30 rounded-full blur-xl opacity-50"
        animate={{
          scale: [1, 1.05, 0.95, 1],
          translateX: [0, 20, 40, 0],
          translateY: [0, -15, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 3,
          ease: "easeInOut"
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Why Choose Guidfy?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform guides your tech career with structured learning, portfolio building, and direct opportunities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 mx-0  md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white/80  flex flex-col items-center backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20"
              >
                {/* Hover Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                {/* Icon Container */}
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300 w-fit mb-4">
                  <IconComponent className={feature.iconStyle} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;