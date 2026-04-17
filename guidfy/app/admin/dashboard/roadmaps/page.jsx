'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRoadmaps } from '../../../hooks/useRoadmaps';
import RoadmapFilters from '../../../components/admin/dashboard/roadmap/RoadmapFilters';
import RoadmapTable from '../../../components/admin/dashboard/roadmap/RoadmapGrid';
import RoadmapPagination from '../../../components/admin/dashboard/roadmap/RoadmapPagination';
import Loader from '../../../components/ui/Loader';

export default function RoadmapsPage() {
  const { loading, pagination, fetchAssignedRoadmaps, assignedRoadmaps } = useRoadmaps();
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    fetchAssignedRoadmaps(filters);
  }, [filters, fetchAssignedRoadmaps]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (loading && assignedRoadmaps.length === 0) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
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

      <RoadmapTable
        roadmaps={assignedRoadmaps}
        readOnly={true} // 👈 مهم
      />

      <RoadmapPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}