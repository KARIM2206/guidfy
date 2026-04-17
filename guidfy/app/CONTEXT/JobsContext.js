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
  getAlljobsToStudentByLearningPathTitle,
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
  const fetchAllJobsTostudentByLearningPathTitle = useCallback(async (title) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAlljobsToStudentByLearningPathTitle(title);
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

  /* ===============================
     Create Job (Admin)
  ================================= */
  const createJob = useCallback(async (jobData) => {
    setLoading(true);
    setError(null);

    try {
      const newJob = await addJob(jobData);
     
      // تضيفه للقائمة فوراً
      setJobs((prev) => [...prev, newJob.data || newJob]);
   await fetchJobs();
      return newJob;
    } catch (err) {
      setError(err.message || 'Failed to create job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Update Job
  ================================= */
  const editJob = useCallback(async (id, jobData) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await updateJob(id, jobData);

      setJobs((prev) =>
        prev.map((job) =>
          job.id === id ? (updated.data || updated) : job
        )
      );
  await fetchJobs();
      if (currentJob?.id === id) {
        setCurrentJob(updated.data || updated);
      }

      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentJob]);
  /* ===============================
     Change Status Job
  ================================= */
  const changeStatusForJob = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await changeStatus(id,status );

      setAllJobs((prev) =>
        prev.map((job) =>
          job.id === id ? (updated.data || updated) : job
        )
      );
  // await fetchJobs();
      if (currentJob?.id === id) {
        setCurrentJob(updated.data || updated);
      }

      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===============================
     Delete Job
  ================================= */
  const removeJob = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
   const res=await deleteJob(id);
    if (res.success) {
         setAllJobs(prev => prev.filter(job => job.id !== id));
           setJobs(prev => prev.filter(job => job.id !== id));

    }
    
    } catch (err) {
      setError(err.message || 'Failed to delete job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchAllJobsTostudentByLearningPathTitle
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