'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import {
  addJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  getAllJobs,
  changeStatus,
  // getAlljobsToStudentByLearningPathTitle,
  getAlljobsToStudentByLearningPathId,
} from '@/services/admin/jobs'; // عدل المسار حسب مشروعك

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===============================
     Fetch All Jobs
  ================================= */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJobs();
      console.log(data,'data in get jobs');
      
      setJobs(data.jobs || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllJobs();
      console.log(data,'data in get jobs');
      
      setAllJobs(data.jobs || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchAllJobsTostudentByLearningPathId = useCallback(async ({learningPathId,page,limit}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAlljobsToStudentByLearningPathId({learningPathId,page,limit});
      console.log(data,'data in get jobs');
      
      setAllJobs(data.jobs || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Fetch Single Job
  ================================= */
  const fetchJobById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJobById(id);
      setCurrentJob(data?.data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  }, []);

// JobContext / Provider
const createJob = useCallback(async (jobData) => {
  setLoading(true);
  try {
    const newJob = await addJob(jobData);
    await fetchAllJobs();        // ← الأهم للسوبر ادمن
    await fetchJobs();           // للأدمن
    return newJob;
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchAllJobs, fetchJobs]);

const editJob = useCallback(async (id, jobData) => {
  setLoading(true);
  try {
    await updateJob(id, jobData);
    await fetchAllJobs();
    await fetchJobs();
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchAllJobs, fetchJobs]);

const changeStatusForJob = useCallback(async (id, status) => {
  setLoading(true);
  try {
    await changeStatus(id, status);
    await fetchAllJobs();   // مهم جداً للسوبر ادمن
    await fetchJobs();
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchAllJobs, fetchJobs]);

const removeJob = useCallback(async (id) => {
  setLoading(true);
  try {
    await deleteJob(id);
    await fetchAllJobs();
    await fetchJobs();
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchAllJobs, fetchJobs]);

  const value = {
    jobs,
    currentJob,
    loading,
    error,
    fetchJobs,
    fetchJobById,
    createJob,
    editJob,
    removeJob,
    allJobs,
    fetchAllJobs,
    changeStatusForJob,
    fetchAllJobsTostudentByLearningPathId
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error(
      'useJobContext must be used within JobProvider'
    );
  }
  return context;
};