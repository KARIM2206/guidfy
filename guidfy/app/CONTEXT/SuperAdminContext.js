'use client';

import { createContext, useContext, useState } from 'react';

const SuperAdminContext = createContext();

export const useSuperAdmin = () => useContext(SuperAdminContext);

export const SuperAdminProvider = ({ children }) => {
  // Mock data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  ]);

  const [learningPaths, setLearningPaths] = useState([
    { id: 1, title: 'Frontend Developer', description: 'Become a frontend expert', jobs: 'Frontend Dev', projects: 'Build a dashboard', estimatedDuration: '6 months', createdBy: 'Admin', roadmapIds: [1] },
  ]);

  const [roadmaps, setRoadmaps] = useState([
    {
      id: 1,
      title: 'React Basics',
      slug: 'react-basics',
      category: 'Frontend',
      level: 'Beginner',
      estimatedDuration: '2 weeks',
      createdBy: 'Admin',
      learningPathIds: [1],
      steps: [
        {
          id: 1,
          title: 'Introduction',
          order: 1,
          lessons: [
            { id: 1, title: 'What is React?', type: 'ARTICLE', content: 'React is a JavaScript library for building user interfaces.' },
          ],
        },
      ],
    },
  ]);

  // Users CRUD
  const addUser = (user) => setUsers([...users, { ...user, id: Date.now() }]);
  const updateUser = (id, updated) => setUsers(users.map(u => u.id === id ? updated : u));
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));

  // Learning Paths CRUD
  const addLearningPath = (path) => setLearningPaths([...learningPaths, { ...path, id: Date.now() }]);
  const updateLearningPath = (id, updated) => setLearningPaths(learningPaths.map(p => p.id === id ? updated : p));
  const deleteLearningPath = (id) => setLearningPaths(learningPaths.filter(p => p.id !== id));

  // Roadmaps CRUD
  const addRoadmap = (roadmap) => setRoadmaps([...roadmaps, { ...roadmap, id: Date.now(), steps: [] }]);
  const updateRoadmap = (id, updated) => setRoadmaps(roadmaps.map(r => r.id === id ? updated : r));
  const deleteRoadmap = (id) => setRoadmaps(roadmaps.filter(r => r.id !== id));

  // Steps & Lessons
  const addStep = (roadmapId, step) => {
    setRoadmaps(roadmaps.map(r => r.id === roadmapId ? { ...r, steps: [...r.steps, { ...step, id: Date.now(), lessons: [] }] } : r));
  };
  const updateStep = (roadmapId, stepId, updated) => {
    setRoadmaps(roadmaps.map(r => r.id === roadmapId ? { ...r, steps: r.steps.map(s => s.id === stepId ? { ...s, ...updated } : s) } : r));
  };
  const deleteStep = (roadmapId, stepId) => {
    setRoadmaps(roadmaps.map(r => r.id === roadmapId ? { ...r, steps: r.steps.filter(s => s.id !== stepId) } : r));
  };
  const addLesson = (roadmapId, stepId, lesson) => {
    setRoadmaps(roadmaps.map(r => r.id === roadmapId ? { ...r, steps: r.steps.map(s => s.id === stepId ? { ...s, lessons: [...s.lessons, { ...lesson, id: Date.now() }] } : s) } : r));
  };
  const updateLesson = (roadmapId, stepId, lessonId, updated) => {
    setRoadmaps(roadmaps.map(r => r.id === roadmapId ? { ...r, steps: r.steps.map(s => s.id === stepId ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, ...updated } : l) } : s) } : r));
  };
  const deleteLesson = (roadmapId, stepId, lessonId) => {
    setRoadmaps(roadmaps.map(r => r.id === roadmapId ? { ...r, steps: r.steps.map(s => s.id === stepId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s) } : r));
  };

  return (
    <SuperAdminContext.Provider value={{
      users, learningPaths, roadmaps,
      addUser, updateUser, deleteUser,
      addLearningPath, updateLearningPath, deleteLearningPath,
      addRoadmap, updateRoadmap, deleteRoadmap,
      addStep, updateStep, deleteStep,
      addLesson, updateLesson, deleteLesson,
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
};