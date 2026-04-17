'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import {
  addProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById,
  getAllProjects,
  changeProjectStatus,
  assignAdminsToProject,
} from '@/services/admin/project'; // عدل المسار حسب مشروعك

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [assigningAdmins, setAssigningAdmins] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===============================
     Fetch All Projects (Admin)
  ================================= */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjects();
      setProjects(data.projects || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Fetch All Projects (Super Admin)
  ================================= */
  const fetchAllProjects = useCallback(async (title) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllProjects(title);
      setAllProjects(data.projects || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch all projects');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Fetch Single Project
  ================================= */
  const fetchProjectById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjectById(id);
      setCurrentProject(data?.data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Create Project
  ================================= */
  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);

    try {
      const newProject = await addProject(projectData);
      setProjects((prev) => [...prev, newProject.data || newProject]);
      await fetchProjects();
      return newProject;
    } catch (err) {
      setError(err.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Update Project
  ================================= */
  const editProject = useCallback(async (id, projectData) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await updateProject(id, projectData);
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? (updated.data || updated) : proj))
      );
      await fetchProjects();

      if (currentProject?.id === id) {
        setCurrentProject(updated.data || updated);
      }

      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);
  const assignAdminsForProject = useCallback(async (id, adminIds) => {
    setLoading(true);
    setError(null);

    try {
      const assigned = await assignAdminsToProject(id, adminIds);
      if (assigned.success) {
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? (updated.data || updated) : proj))
      );
      console.log(assigned);
 
    }
  

      return assigned;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Change Status Project
  ================================= */
  const changeStatusForProject = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await changeProjectStatus(id, status);
      console.log(updated);
      
      if (updated.success) {
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? (updated.data || updated) : proj))
      );
     await fetchAllProjects()
      //  setAllProjects((prev) =>
      //   prev.map((proj) => (proj.id === id ? (updated.data || updated) : proj))
      // ); 
      }

     if (currentProject?.id === id) {
        setCurrentProject(updated.data || updated);
      
     }

      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  /* ===============================
     Delete Project
  ================================= */
  const removeProject = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await deleteProject(id);
      if (res.success) {
        setAllProjects((prev) => prev.filter((proj) => proj.id !== id));
        setProjects((prev) => prev.filter((proj) => proj.id !== id));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    editProject,
    removeProject,
    allProjects,
    fetchAllProjects,
    changeStatusForProject,
    assignAdminsForProject
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};