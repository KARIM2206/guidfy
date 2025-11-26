"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Solid Grey Background */}
      <div className="absolute inset-0 bg-gray-100" />
      
      {/* Animated Blobs */}
      <motion.div
        className="absolute top-0 left-0 h-72 w-72 bg-blue-200/70 rounded-full blur-xl mix-blend-multiply opacity-80"
        animate={{
          scale: [1, 1.1, 0.9, 1],
          translateX: [0, 30, 60, 0],
          translateY: [0, -20, 40, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-72 bg-cyan-200/60 rounded-full blur-2xl mix-blend-multiply opacity-70"
        animate={{
          scale: [1, 1.1, 0.9, 1],
          translateX: [0, 30, 60, 0],
          translateY: [0, -20, 40, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          delay: 3,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Main Heading */}
            <h3 className="text-4xl md:text-5xl lg:text-6xl text-gray-800 font-bold leading-snug mb-4">
              Learn, Build,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Get Seen
              </span>
            </h3>

            {/* Subheading */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 font-medium">
              Your All-in-One Platform to Learn, Build, and Launch Your Tech Career.
            </p>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 font-medium">
              Stop navigating the chaos alone. Guidfy provides the structured path, 
              the showcase portfolio, and the direct industry connections you need 
              to go from student to professional.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl border-2 border-white/20 transition-all duration-300"
              >
                Start Learning
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-400 font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                Showcase Portfolio
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600 text-center"
      >
        <p className="text-sm mb-2">Scroll To Explore</p>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="h-5 w-5 mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;