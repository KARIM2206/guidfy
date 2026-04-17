'use client';

import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import StatusBadge from '@/app/components/admin/dashboard/jobs/StatusBadge';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useJobs } from '@/app/hooks/useJobs';

export default function JobsTable({ selectedLearningPath, openJobModal, openDeleteModal ,onStatusChange}) {
  const { allJobs, editJob, removeJob, loading, } = useJobs();

  // فلترة الجوبز حسب الليرننج باس المحدد
  const filteredJobs = selectedLearningPath
    ? allJobs.filter((job) => job.learningPathId == selectedLearningPath)
    : allJobs;

  // const handleStatusChange = async (jobId, newStatus) => {
  //   try {
  //     await editJob(jobId, { status: newStatus });
  //     toast.success('Job status updated!');
  //   } catch (err) {
  //     toast.error(err.message || 'Failed to update job status');
  //   }
  // };

  const handleDelete = (job) => {
    openDeleteModal(job);
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'location', label: 'Location' },
    { 
      key: 'status', 
      label: 'Status',
      render: (job) => (
       <StatusBadge status={job.status} onChange={(newStatus) => onStatusChange(job.id, newStatus)} />
      )
    },
    { key: 'deadline', label: 'Deadline', render: (job) => new Date(job.deadline).toLocaleDateString() },
  ];

  return (
    <Table
      columns={columns}
      data={filteredJobs}
      loading={loading}
      renderActions={(job) => (
        <div className="flex gap-2">
          <Button onClick={() => openJobModal(job)} variant="outline">
            <Eye size={16} />
          </Button>
          <Button onClick={() => handleDelete(job)} variant="danger">
            <Trash2 size={16} />
          </Button>
        </div>
      )}
      emptyMessage="No jobs available for this Learning Path."
    />
  );
}