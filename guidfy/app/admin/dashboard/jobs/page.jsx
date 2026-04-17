"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import JobsHeader from "@/app/components/admin/dashboard/jobs/JobsHeader";
import JobsTable from "@/app/components/admin/dashboard/jobs/JobsTable";
import JobModal from "@/app/components/admin/dashboard/jobs/JobModal";
import DeleteConfirmModal from "@/app/components/admin/dashboard/jobs/DeleteConfirmModal";
import EmptyState from "@/app/components/admin/dashboard/jobs/EmptyState";
import { toast } from "react-toastify";
import { useJobs } from "@/app/hooks/useJobs";
import { useLearningPaths } from "@/app/hooks/useLearningPath";
// import { toast } from 'react-hot-toast';

export default function JobsPage() {
  const { jobs, fetchJobs, createJob, editJob, removeJob } = useJobs();
  const { adminLearningPaths, fetchLearningPathsToAdmins } = useLearningPaths();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  useEffect(() => {
    if (filter === "all") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) => job.status === filter);
      setFilteredJobs(filtered);
    }
  }, [filter, jobs]);
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        await fetchLearningPathsToAdmins("JOB");
      } catch (error) {
        console.error("Error fetching learning paths:", error);
      }
    };
    fetchLearningPaths();
  }, []);
  useEffect(() => {
    const fetch = async () => {
      await fetchJobs();
    };
    fetch();
  }, [fetchJobs]);

  const handleCreate = async (data) => {
    console.log('data \n',data);
    
    try {
      await createJob(data);

      toast.success("Job created successfully");
    } catch (error) {
      toast.error("Failed to create job");
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await editJob(id, data);
      toast.success("Job updated successfully");
    } catch (error) {
      toast.error("Failed to update job");
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeJob(id);
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };
  const openAddModal = () => {
    setModalMode("add");
    //   setFormData({
    //     title: "",
    //     description: "",
    //     company: "",
    //     location: "",
    //     salary: "",
    //     jobType: "",
    //     learningPath: "",
    //     deadline: "",
    //   });
    setModalOpen(true);
  };
  console.log(modalOpen);

  //   if (jobs.length === 0) return <EmptyState openAddModal={openAddModal} />;

  return (
    <motion.div className="min-h-screen p-6 bg-gray-50">
      <JobsHeader
        openAddModal={() => {
          setModalMode("add");
          setModalOpen(true);
        }}
        filter={filter}
        setFilter={setFilter}
        isDisabledAdd={adminLearningPaths.length === 0} // ✅ disable add button if no learning paths
      
      />
      {jobs.length === 0 ? (
        <EmptyState
          openAddModal={openAddModal}
          isDisabledAdd={adminLearningPaths.length === 0} // ✅ disable add button if no learning paths
        />
      ) : (
        <JobsTable
          jobs={filteredJobs}
          setModalOpen={setModalOpen}
          setModalMode={setModalMode}
          setSelectedJob={setSelectedJob}
          setDeleteOpen={setDeleteOpen}
        />
      )}

      <JobModal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        mode={modalMode}
        job={selectedJob}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />
      <DeleteConfirmModal
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
        job={selectedJob}
        onDelete={handleDelete}
      />
    </motion.div>
  );
}
