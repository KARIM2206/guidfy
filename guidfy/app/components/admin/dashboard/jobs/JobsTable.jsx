'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import StatusBadge from './StatusBadge';

export default function JobsTable({ jobs, setModalOpen, setModalMode, setSelectedJob, setDeleteOpen }) {
console.log(jobs);

  const handleEdit = (job) => {
    setSelectedJob(job);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setDeleteOpen(true);
  };

  return (
    <Table
      data={jobs}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'company', label: 'Company' },
        { 
  key: 'learningPath', 
  label: 'Learning Path', 
  render: (row) => row.learningPath?.title || '—' 
},
        { key: 'jobType', label: 'Job Type' },
        { key: 'status', label: 'Status' },
        { key: 'deadline', label: 'Deadline', render: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString() : '—' },
      ]}
      renderActions={(job) => (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => handleView(job)} variant="outline"><Eye size={16} /></Button>
          <Button onClick={() => handleEdit(job)} variant="outline"><Pencil size={16} /></Button>
          <Button onClick={() => handleDelete(job)} variant="danger"><Trash2 size={16} /></Button>
        </div>
      )}
    />
  );
}