'use client';

import LearningGrid from "./LearningGrid";
import SkeletonCard from "./SkeletonCard";

export default function LearningGridSection({ loading, paths }) {

  return (
    <section id="learning-grid" className="px-4 sm:px-6 mt-8">

      <h2 className="text-lg font-semibold text-white mb-4">
        All Learning Paths
      </h2>

      {loading
        ? <SkeletonCard/>
        : <LearningGrid paths={paths}/>
      }

    </section>
  );
}