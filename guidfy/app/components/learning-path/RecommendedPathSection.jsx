'use client';

import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import LearningCard from "./LearningCard";

export default function RecommendedPathSection({ path ,onBrowseAll}) {

  if (!path) return null;

  return (
    <section className="px-4 sm:px-6 mt-6">

      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-white">
          Recommended For You
        </h2>

        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md
        bg-violet-500/20 text-violet-300 border border-violet-500/30">
          <Sparkles className="w-3 h-3"/>
          AI
        </span>
      </div>

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:.4}}
        className="max-w-sm flex flex-col gap-4"
      >
        <LearningCard path={path} highlight />
        <div className="flex items-center gap-2">
            <p className="text-sm ">do you want show all paths</p>
            <button className="text-sm text-violet-400 decoration-amber-100" onClick={onBrowseAll}>Browse All</button>
        </div>
      </motion.div>

    </section>
  );
}