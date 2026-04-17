'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import ProjectsHeader from '@/app/components/admin/dashboard/projects/ProjectsHeader';
import ProjectsTable from '@/app/components/admin/dashboard/projects/ProjectsTable';
import ProjectModal from '@/app/components/admin/dashboard/projects/ProjectModal';
import DeleteConfirmModal from '@/app/components/admin/dashboard/projects/DeleteConfirmModal';
import EmptyState from '@/app/components/admin/dashboard/projects/EmptyState';
import { toast } from 'react-toastify';
import { useProject } from '@/app/hooks/useProject';
import { useLearningPaths } from '@/app/hooks/useLearningPath';
// الهُوك الجديد للبروجكت

export default function ProjectsPage() {
  const {
    projects,
    fetchProjects,
    createProject,
    editProject,
    removeProject,
    allProjects,
    fetchAllProjects,
    changeStatusForProject,
  } = useProject();
 const { adminLearningPaths, fetchLearningPathsToAdmins } = useLearningPaths();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit, view
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((proj) => proj.status === filter);
      setFilteredProjects(filtered);
    }
  }, [filter, projects]);

  useEffect(() => {
    const fetch = async () => {
      await fetchProjects();
    };
    fetch();
  }, [fetchProjects]);
 useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        await fetchLearningPathsToAdmins("PROJECT");
      } catch (error) {
        console.error("Error fetching learning paths:", error);
      }
    };
    fetchLearningPaths();
  }, []);
  const handleCreate = async (data) => {
    try {
      await createProject(data);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await editProject(id, data);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeProject(id);
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setModalOpen(true);
  };

  return (
    <motion.div className="min-h-screen p-6 bg-gray-50">
      <ProjectsHeader 
        openAddModal={openAddModal} 
        filter={filter}
        setFilter={setFilter}
        isDisabledAdd={adminLearningPaths.length === 0} // ✅ disable add button if no learning paths
      />

      {projects.length === 0 ? (
        <EmptyState openAddModal={openAddModal} />
      ) : (
        <ProjectsTable
          projects={filteredProjects}
          setModalOpen={setModalOpen}
          setModalMode={setModalMode}
          setSelectedProject={setSelectedProject}
          setDeleteOpen={setDeleteOpen}
        />
      )}

      <ProjectModal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        mode={modalMode}
        project={selectedProject}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
        project={selectedProject}
        onDelete={handleDelete}
      />
    </motion.div>
  );
}