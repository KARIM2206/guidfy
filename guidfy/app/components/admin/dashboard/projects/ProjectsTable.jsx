'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import StatusBadge from './StatusBadge';

export default function ProjectsTable({ projects, setModalOpen, setModalMode, setSelectedProject, setDeleteOpen }) {

  const handleEdit = (project) => {
    setSelectedProject(project);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (project) => {
    setSelectedProject(project);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = (project) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };
  console.log('projects', projects);
  

  return (
    <Table
      data={projects}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'technologies', label: 'Technologies', render: (row) => row.technologies?.join(', ') || '—' },
        { key: 'learningPath', label: 'Learning Path', render: (row) => row.learningPath?.title || '—' },
        { key: 'isFeatured', label: 'Featured', render: (row) => row.isFeatured ? 'Yes' : 'No' },
        { key: 'status', label: 'Status' },
      ]}
      renderActions={(project) => (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => handleView(project)} variant="outline"><Eye size={16} /></Button>
          <Button onClick={() => handleEdit(project)} variant="outline"><Pencil size={16} /></Button>
          <Button onClick={() => handleDelete(project)} variant="danger"><Trash2 size={16} /></Button>
        </div>
      )}
    />
  );
}