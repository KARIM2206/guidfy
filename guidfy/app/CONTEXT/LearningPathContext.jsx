'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import {
  getLearningPaths,
  getLearningPathById,
  addLearningPath,
  updateLearningPath,
  deleteLearningPath,
  toggleLearningPathPublish,
  getLearningPathByTitle,
  assignAdminsToLearningPath,
  getLearningPathsForAdmin,
  recommendLearningPath,
  getMyRecommendations,
} from '../../services/superAdmin/learningPath';
import { enrollStudentInLearningPath } from '@/services/student/student';

const LearningPathContext = createContext();

export const LearningPathProvider = ({ children }) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [adminLearningPaths, setAdminLearningPaths] = useState([]);
  const [currentLearningPath, setCurrentLearningPath] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  /* ===============================
     Fetch All Learning Paths
  ================================= */
  const fetchLearningPaths = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLearningPaths(params);

      setLearningPaths(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch learning paths');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Fetch Single Learning Path
  ================================= */
  const fetchLearningPathById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLearningPathById(id);
      setCurrentLearningPath(data?.data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch learning path');
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchLearningPathByTitle = useCallback(async (title) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLearningPathByTitle(title);
      setCurrentLearningPath(data?.data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch learning path');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Create Learning Path
  ================================= */
  const createLearningPath = useCallback(async (learningPathData) => {
    setLoading(true);
    setError(null);

    try {
      const newLearningPath = await addLearningPath(learningPathData);
      return newLearningPath;
    } catch (err) {
      setError(err.message || 'Failed to create learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  


  /* ===============================
     Update Learning Path
  ================================= */
  const editLearningPath = useCallback(
    async (id, learningPathData) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await updateLearningPath(id, learningPathData);

        if (currentLearningPath?.id === id) {
          setCurrentLearningPath(updated.data || updated);
        }

        return updated;
      } catch (err) {
        setError(err.message || 'Failed to update learning path');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentLearningPath]
  );

  /* ===============================
     Delete Learning Path
  ================================= */
  const removeLearningPath = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteLearningPath(id);
      setLearningPaths((prev) =>
        prev.filter((lp) => lp.id !== id)
      );
    } catch (err) {
      setError(err.message || 'Failed to delete learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Toggle Publish
  ================================= */
  const publishLearningPath = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await toggleLearningPathPublish(id);

        // تحديث القائمة مباشرة
        setLearningPaths((prev) =>
          prev.map((lp) =>
            lp.id === id
              ? { ...lp, isPublished: updated.data.isPublished }
              : lp
          )
        );

        // تحديث الحالية لو مفتوحة
        if (currentLearningPath?.id === id) {
          setCurrentLearningPath(updated.data);
        }

        return updated;
      } catch (err) {
        setError(err.message || 'Failed to toggle publish status');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentLearningPath]
  );
  
  const enrollLearningPathToStudent = useCallback(async (learningPathId) => {
    setLoading(true);
    setError(null);

    try {
      const newEnrolled = await enrollStudentInLearningPath({learningPathId});
      return newEnrolled;
    } catch (err) {
      setError(err.message || 'Failed to create learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const assignLearningPathToAdmins = useCallback(async ({learningPathId, data={}}) => {
    setLoading(true);
    setError(null);

    try {
      const newAssigned = await assignAdminsToLearningPath({learningPathId,data});
       if (newAssigned.success) {
        await fetchLearningPaths()
       }
      return newAssigned;
    } catch (err) {
      setError(err.message || 'Failed to create learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchLearningPathsToAdmins = useCallback(async (section) => {
    setLoading(true);
    setError(null);

    try {
      const newAssigned = await getLearningPathsForAdmin(section);
      setAdminLearningPaths(newAssigned.data);
      return newAssigned;
    } catch (err) {
      setError(err.message || 'Failed to create learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 const recommendLearningPathToStudent = useCallback(async (features) => {
  setLoading(true);
  setError(null);
  try {
    const recommend=await recommendLearningPath(features);
    console.log('recommend',recommend);
    if (recommend.success) {
     setRefresh(prev=>!prev) 
    }
    return recommend
  } catch (error) {
    console.error(
      "Error fetching learning paths for admin:",
      error.response?.data || error.message);
    
  }

 })
 const fetchRecommendations = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const recommend=await getMyRecommendations();
    console.log('recommend',recommend);
    
    return recommend
  } catch (error) {
    console.error(
      "Error fetching learning paths for admin:",
      error.response?.data || error.message);
    
  }
 })
  const value = {
    learningPaths,
    currentLearningPath,
    loading,
    error,
    pagination,
    adminLearningPaths,
    fetchLearningPaths,
    fetchLearningPathById,
    createLearningPath,
    editLearningPath,
    removeLearningPath,
    publishLearningPath,
    fetchLearningPathByTitle,
    enrollLearningPathToStudent,
    assignLearningPathToAdmins,
    fetchLearningPathsToAdmins,
recommendLearningPathToStudent,
fetchRecommendations,
refresh
  };

  return (
    <LearningPathContext.Provider value={value}>
      {children}
    </LearningPathContext.Provider>
  );
};

export const useLearningPathContext = () => {
  const context = useContext(LearningPathContext);
  if (!context) {
    throw new Error(
      'useLearningPathContext must be used within LearningPathProvider'
    );
  }
  return context;
};