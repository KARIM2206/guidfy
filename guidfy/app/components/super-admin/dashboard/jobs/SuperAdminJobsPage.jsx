'use client';

import { useState, useEffect, useMemo } from 'react'; // ✅ أضف useMemo
import { toast } from 'react-toastify';

import JobsHeader from './JobsHeader';
import JobsTable from '@/app/components/super-admin/dashboard/jobs/JobsTable';
import JobModal from './JobModal';
import DeleteConfirmModal from './DeleteConfirmModal';

import { useJobs } from '@/app/hooks/useJobs';
import { useLearningPaths } from '@/app/hooks/useLearningPath';

export default function SuperAdminJobsPage() {
  const { 
    allJobs, 
    fetchAllJobs, 
    changeStatusForJob, 
    removeJob 
  } = useJobs();

  const { learningPaths, fetchLearningPaths } = useLearningPaths();

  const [learningPathFilter, setLearningPathFilter] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // ✅ جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchAllJobs(),
        fetchLearningPaths()
      ]);
    };
    fetchData();
  }, [fetchAllJobs, fetchLearningPaths]);

  // ✅ الفلترة باستخدام useMemo – مباشرة بدون تأخير
  const filteredJobs = useMemo(() => {
    if (filter === "all") return allJobs;
    return allJobs.filter((job) => job.status === filter);
  }, [filter, allJobs]);

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewModalOpen(true);
  };

  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await removeJob(jobToDelete.id);
      toast.success('Job deleted successfully');
      setDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await changeStatusForJob(jobId, newStatus);
      toast.success('Job status updated successfully');
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };

  return (
    <div className="p-6">
      <JobsHeader 
        filter={filter}
        setFilter={setFilter}
        learningPathFilter={learningPathFilter}
        setLearningPathFilter={setLearningPathFilter}
        learningPaths={learningPaths}
      />

      {/* ✅ key تُجبر الجدول على إعادة التصيير عند تغيير الفلتر */}
      <JobsTable
        key={`${filter}-${learningPathFilter}`}
        jobs={filteredJobs}
        onView={handleViewJob}
        onDelete={handleDeleteJob}
        onStatusChange={handleStatusChange}
        selectedLearningPath={learningPathFilter}
        openJobModal={handleViewJob}
        openDeleteModal={handleDeleteJob}
      />

      {selectedJob && (
        <JobModal
          isOpen={viewModalOpen}
          setIsOpen={setViewModalOpen}
          mode="view"
          job={selectedJob}
          learningPaths={learningPaths}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setJobToDelete(null);
        }}
        onConfirm={confirmDeleteJob}
        message={`Are you sure you want to delete "${jobToDelete?.title}"?`}
      />
    </div>
  );
}