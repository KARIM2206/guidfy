'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAssignedRoadmaps } from '../../../hooks/useRoadmaps';
import RoadmapFilters from '../../../components/admin/dashboard/roadmap/RoadmapFilters';
import RoadmapGrid from '../../../components/admin/dashboard/roadmap/RoadmapGrid';
import RoadmapPagination from '../../../components/admin/dashboard/roadmap/RoadmapPagination';
import Loader from '../../../components/ui/Loader';

export default function RoadmapsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  const { data, isLoading, isError, error, isPending } = useAssignedRoadmaps(filters);

  // ✅ Fallbacks متعددة الطبقات
  const roadmaps = data?.data ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // ⏳ Loading (isPending في TanStack v5 = معندناش داتا خالص)
  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // ❌ Error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <p className="text-lg font-semibold">Failed to load roadmaps</p>
        <p className="text-sm text-gray-500">{error?.message || 'Something went wrong'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          My Assigned Roadmaps
        </motion.h1>
      </div>

      <RoadmapFilters onFilterChange={handleFilterChange} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RoadmapGrid roadmaps={roadmaps} readOnly={true} />
      </motion.div>

      <RoadmapPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}