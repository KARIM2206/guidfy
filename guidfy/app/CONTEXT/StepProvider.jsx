// context/StepContext.jsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import {
  getStepsByRoadmap,
  getStepById,
  addStep,
  updateStep,
  deleteStep,
} from '@/services/admin/step';
import { getStudentRoadmapStepsByRoadmapId } from '@/services/student/student';

const StepContext = createContext();

export const StepProvider = ({ children }) => {
  const [steps, setSteps] = useState([]);
  const [studentSteps, setStudentSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  /* ===============================
     Fetch Steps By Roadmap
  ================================= */
  const fetchStepsByRoadmap = useCallback(async (roadmapId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStepsByRoadmap(roadmapId);
      // Assuming API returns { data: stepsArray, success: true }
      const stepsData = response.data || response;
      setSteps(stepsData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch steps');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchStudentStepsByRoadmap = useCallback(async (roadmapId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentRoadmapStepsByRoadmapId(roadmapId);
      // Assuming API returns { data: stepsArray, success: true }
      const stepsData = response.data || response;
      setStudentSteps(stepsData);
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch steps');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Fetch Single Step
  ================================= */
  const fetchStepById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStepById(id);
      const stepData = response.data || response;
      setCurrentStep(stepData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch step');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Create Step
  ================================= */
const createStep = useCallback(async (stepData) => {
  setLoading(true);
  setError(null);
  try {
    const response = await addStep(stepData);
    const newStep = response.data || response;

    // ✅ تأكد إن lessons موجودة
    setSteps((prevSteps) => [...prevSteps, { lessons: [], ...newStep }]);

    setRefreshTrigger(prev => !prev);
    return newStep;
  } catch (err) {
    setError(err.message || 'Failed to create step');
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  /* ===============================
     Update Step
  ================================= */
  const editStep = useCallback(async (id, stepData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateStep(id, stepData);
      const updatedStep = response.data || response;

      // Update steps array
      setSteps((prevSteps) =>
        prevSteps.map((step) => (step.id === id ? updatedStep : step))
      );

      // Update currentStep if it's the one being edited
      if (currentStep?.id === id) {
        setCurrentStep(updatedStep);
      }

      return updatedStep;
    } catch (err) {
      setError(err.message || 'Failed to update step');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentStep]);

  /* ===============================
     Delete Step
  ================================= */
  const removeStep = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteStep(id);

      // Remove from local state
      setSteps((prevSteps) => prevSteps.filter((step) => step.id !== id));

      // Clear currentStep if it's the deleted one
      if (currentStep?.id === id) {
        setCurrentStep(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete step');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentStep]);

  const value = {
    steps,
    currentStep,
    loading,
    error,
    fetchStepsByRoadmap,
    fetchStepById,
    createStep,
    editStep,
   studentSteps,
    fetchStudentStepsByRoadmap,
    removeStep,
    refreshTrigger,
    setRefreshTrigger,
  };

  return (
    <StepContext.Provider value={value}>
      {children}
    </StepContext.Provider>
  );
};

export const useStepContext = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useStepContext must be used within StepProvider');
  }
  return context;
};