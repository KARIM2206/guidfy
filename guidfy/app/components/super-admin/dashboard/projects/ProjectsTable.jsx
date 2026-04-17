'use client';

import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import StatusBadge from '@/app/components/admin/dashboard/projects/StatusBadge';
import { Eye, Trash2 } from 'lucide-react';
import { useProject } from '@/app/hooks/useProject';


export default function ProjectsTable({ 
  selectedLearningPath, 
  openProjectModal, 
  openDeleteModal, 
  onStatusChange 
}) {

  const { allProjects, loading } = useProject();

  // فلترة البروجيكتس حسب الليرننج باس المحدد
  const filteredProjects = selectedLearningPath
    ? allProjects.filter(
        (project) => project.learningPathId == selectedLearningPath
      )
    : allProjects;

  const handleDelete = (project) => {
    openDeleteModal(project);
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },

    { 
      key: 'technologies', 
      label: 'Technologies',
      render: (project) =>
        project.technologies?.join(', ')
    },

    { 
      key: 'status', 
      label: 'Status',
      render: (project) => (
        <StatusBadge
          status={project.status}
          onChange={(newStatus) =>
            onStatusChange(project.id, newStatus)
          }
        />
      )
    },

    { 
      key: 'isFeatured', 
      label: 'Featured',
      render: (project) => project.isFeatured ? 'Yes' : 'No'
    },
  ];

  return (
    <Table
      columns={columns}
      data={filteredProjects}
      loading={loading}
      renderActions={(project) => (
        <div className="flex gap-2">
          <Button
            onClick={() => openProjectModal(project)}
            variant="outline"
          >
            <Eye size={16} />
          </Button>

          <Button
            onClick={() => handleDelete(project)}
            variant="danger"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}
      emptyMessage="No projects available for this Learning Path."
    />
  );
}