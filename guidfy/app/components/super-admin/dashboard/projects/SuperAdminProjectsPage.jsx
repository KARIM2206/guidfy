'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import ProjectsHeader from './ProjectsHeader';
import ProjectsTable from './ProjectsTable';
import ProjectModal from './ProjectModal';
import DeleteConfirmModal from '../jobs/DeleteConfirmModal';
import Loader from '@/app/components/ui/Loader';

import { useLearningPaths } from '@/app/hooks/useLearningPath';
import { useProject } from '@/app/hooks/useProject';

export default function SuperAdminProjectsPage() {
  const { 
    allProjects, 
    projects,
    fetchAllProjects, 
    removeProject, 
    changeStatusForProject, 
    loading 
  } = useProject();

  const { learningPaths, fetchLearningPaths } = useLearningPaths();

  const [filterLearningPath, setFilterLearningPath] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // 🔥 تحميل البيانات
  useEffect(() => {
    const fetch = async () => {
      await fetchAllProjects();
      await fetchLearningPaths();
    };
    fetch();
  }, [fetchAllProjects, fetchLearningPaths]);

  // 🔎 فلترة حسب Learning Path
  const filteredProjects = filterLearningPath
    ? projects.filter(
        (project) => project.learningPathId === Number(filterLearningPath)
      )
    : allProjects;

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await removeProject(projectToDelete.id);
      toast.success('Project deleted successfully');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await changeStatusForProject(projectId, newStatus);
      toast.success('Project status updated');
    } catch (err) {
      toast.error('Failed to update project status');
    }
  };

//   if (loading) return <Loader />;

  return (
    <div className="p-6">

      {/* Header */}
      <ProjectsHeader 
        setFilterLearningPath={setFilterLearningPath} 
        learningPaths={learningPaths}
      />

      {/* Projects Table */}
      <ProjectsTable
        projects={filteredProjects}
        openProjectModal={handleViewProject}
        openDeleteModal={handleDeleteProject}
        onStatusChange={handleStatusChange}
        selectedLearningPath={filterLearningPath}
      />

      {/* View Project Modal */}
      
        <ProjectModal
          isOpen={viewModalOpen}
          setIsOpen={setViewModalOpen}
          learningPaths={learningPaths}

          project={selectedProject}
        />
      {/* )}/ */}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        message={`Are you sure you want to delete "${projectToDelete?.title}"?`}
      />

    </div>
  );
}