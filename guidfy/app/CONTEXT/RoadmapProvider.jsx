// context/RoadmapContext.jsx
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getRoadmaps,
  getRoadmapById,
  addRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleRoadmapPublish,
  getMyAssignedRoadmaps
} from '../../services/admin/roadmap';
import { getStudentRoadmaps } from '@/services/student/student';
// import {  } from '@/services/superAdmin/learningPath';

const RoadmapContext = createContext();

export const RoadmapProvider = ({ children }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [studentRoadmaps, setStudentRoadmaps] = useState({});
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [assignedRoadmaps, setAssignedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // جلب جميع roadmaps مع معاملات
  const fetchRoadmaps = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoadmaps(params);
     
      
      // نتوقع أن يعيد API { data, pagination } مثلاً
      setRoadmaps(data.data || data);

      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchStudentRoadmaps = useCallback(async (title) => {
    setLoading(true);
    setError(null);
    try {
      console.log(title);
      const data = await getStudentRoadmaps(title);
     

      console.log(data, 'data');
      
      setStudentRoadmaps(data.data || data);

      // if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchAssignedRoadmaps = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAssignedRoadmaps(params);
     
      
      // نتوقع أن يعيد API { data, pagination } مثلاً
      setAssignedRoadmaps(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب roadmap واحدة
  const fetchRoadmapById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoadmapById(id);
      
      setCurrentRoadmap(data?.data);
      
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  }, []);

  // إضافة roadmap
  const createRoadmap = useCallback(async (roadmapData) => {
    setLoading(true);
    setError(null);
    try {
      const newRoadmap = await addRoadmap(roadmapData);
      // يمكن إضافته إلى القائمة أو إعادة تحميل القائمة
      return newRoadmap;
    } catch (err) {
      setError(err.message || 'Failed to create roadmap');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // تحديث roadmap
  const editRoadmap = useCallback(async (id, roadmapData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateRoadmap(id, roadmapData);
      // تحديث الحالية إذا كانت مطابقة
      if (currentRoadmap?.id === id) setCurrentRoadmap(updated.data);
     if (!updated.success) {
       setLoading(false);
      throw new Error(updated.message);
     
     }
     setLoading(false);
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update roadmap');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRoadmap]);

  // حذف roadmap
  const removeRoadmap = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRoadmap(id);
      setRoadmaps((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete roadmap');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const toggleRoadmap = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await toggleRoadmapPublish(id);
       
        // تحديث القائمة مباشرة
        setRoadmaps((prev) =>
          prev.map((r) => (r.id === id ? updated.data : r))
        );

        // تحديث الحالية لو مفتوحة
        if (currentRoadmap?.id === id) setCurrentRoadmap(updated.data); 
        return updated;
      } catch (err) {
        setError(err.message || 'Failed to toggle publish status');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentRoadmap]
  );

  const value = {
    roadmaps,
    currentRoadmap,
    loading,
    error,
    pagination,
    assignedRoadmaps,
    fetchAssignedRoadmaps,
    fetchRoadmaps,
    fetchRoadmapById,
    createRoadmap,
    editRoadmap,
    removeRoadmap,
    toggleRoadmap,
    fetchStudentRoadmaps,
    studentRoadmaps
  };

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmapContext = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmapContext must be used within RoadmapProvider');
  }
  return context;
};