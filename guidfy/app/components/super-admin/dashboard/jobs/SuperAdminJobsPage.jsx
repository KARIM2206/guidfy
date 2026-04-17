'use client';

import { useState, useEffect } from 'react';


import JobsHeader from './JobsHeader';
import JobsTable from '@/app/components/super-admin/dashboard/jobs/JobsTable';
import JobModal from './JobModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { toast } from 'react-toastify';
import Loader from '@/app/components/ui/Loader';
import { useJobs } from '@/app/hooks/useJobs';
import { useLearningPaths } from '@/app/hooks/useLearningPath';

export default function SuperAdminJobsPage() {
  const { jobs, fetchJobs, editJob, removeJob, loading,fetchAllJobs,allJobs,changeStatusForJob } = useJobs();
  const { learningPaths, fetchLearningPaths } = useLearningPaths();

  const [filterLearningPath, setFilterLearningPath] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
  const fetch = async () => {
    await fetchAllJobs();
    await fetchLearningPaths();
  } 
    fetch();
  }, [fetchAllJobs, fetchLearningPaths]);

  // جلب الجوبز بعد الفلتر
  const filteredJobs = filterLearningPath
    ? jobs.filter((job) => job.learningPath === filterLearningPath)
    : jobs;

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
      console.log(jobToDelete);
      
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
      console.log(jobId, newStatus);
      
      await changeStatusForJob(jobId, newStatus);
      toast.success('Job status updated');
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };
console.log(filterLearningPath,'=> filterLearningPath');

  // if (loading) return <Loader />;

  return (
    <div className="p-6">
      {/* Header */}
      <JobsHeader setFilterLearningPath={setFilterLearningPath} />

      {/* Jobs Table */}
      <JobsTable
        jobs={allJobs}
        onView={handleViewJob}
        onDelete={handleDeleteJob}
        onStatusChange={handleStatusChange}
        selectedLearningPath={filterLearningPath}
        openJobModal={handleViewJob}
        openDeleteModal={handleDeleteJob}
      />

      {/* View Job Modal */}
      {selectedJob && (
        <JobModal
          isOpen={viewModalOpen}
          setIsOpen={setViewModalOpen}
          mode="view"
          job={selectedJob}
          learningPaths={learningPaths}
        />
      )}

      {/* Delete Confirmation Modal */}
      
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDeleteJob}
          message={`Are you sure you want to delete "${jobToDelete?.title}"?`}
        />
   
    </div>
  );
}