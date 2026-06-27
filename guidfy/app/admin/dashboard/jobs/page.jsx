"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Briefcase,
  Search,
  Plus,
  Trash2,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  Shield,
  Loader,
  BookOpen,
  ChevronDown,
  Filter,
  Users,
  RefreshCw, // ✅ جديد
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import Table from "@/app/components/ui/Table";

import {
  useJobsByLearningPath,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useChangeJobStatus,
  useRecommendedJobs,
} from "@/app/hooks/useJobsQueries";

import { useAdminLearningPaths } from "@/app/hooks/useLearningPath";

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const isAdmin = (role) => ["ADMIN", "SUPER_ADMIN"].includes(role);

// ═══════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════

const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${gradient}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const configs = {
    PUBLISHED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Published" },
    DRAFT: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Draft" },
    CLOSED: { cls: "bg-slate-50 text-slate-600 border-slate-200", label: "Closed" },
    EXPIRED: { cls: "bg-red-50 text-red-700 border-red-200", label: "Expired" },
  };
  const c = configs[status] || configs.DRAFT;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${c.cls}`}>
      {c.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════
// JOB FORM MODAL
// ═══════════════════════════════════════════════════
function JobFormModal({ isOpen, onClose, mode, job, learningPaths, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    jobType: "FULL_TIME",
    learningPathId: "",
    deadline: "",
    status: "DRAFT",
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        company: job.company || "",
        location: job.location || "",
        salary: job.salary || "",
        jobType: job.jobType || "FULL_TIME",
        learningPathId: job.learningPathId || "",
        deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
        status: job.status || "DRAFT",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
        jobType: "FULL_TIME",
        learningPathId: learningPaths[0]?.id || "",
        deadline: "",
        status: "DRAFT",
      });
    }
  }, [job, isOpen, learningPaths]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "create") {
      onSubmit(formData);
    } else {
      onSubmit(job.id, formData);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {mode === "create" ? "Create New Job" : "Edit Job"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <XCircle size={16} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="Job title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="Company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              placeholder="Job description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="City, Country or Remote"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="e.g. $50k - $70k"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Learning Path *</label>
              <select
                required
                value={formData.learningPathId}
                onChange={(e) => setFormData({ ...formData, learningPathId: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              >
                {learningPaths.map((lp) => (
                  <option key={lp.id} value={lp.id}>{lp.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Job" : "Update Job"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// JOB VIEW MODAL
// ═══════════════════════════════════════════════════
function JobViewModal({ isOpen, onClose, job }) {
  if (!isOpen || !job) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
            <StatusBadge status={job.status} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <XCircle size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Briefcase size={12} /> {job.company}</span>
            <span className="flex items-center gap-1"><Layers size={12} /> {job.location || "Remote"}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {job.jobType}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Salary</h4>
              <p className="text-xs text-gray-600">{job.salary || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Deadline</h4>
              <p className="text-xs text-gray-600">
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Learning Path</h4>
            <p className="text-xs text-gray-600">{job.learningPath?.title || "Not assigned"}</p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE — AdminJobsPage (with Assigned Learning Paths)
// ═══════════════════════════════════════════════════
export default function AdminJobsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();

  // ── State ──
  const [selectedLP, setSelectedLP] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ Debounced value
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // ✅ Debounce: 400ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Queries: Get Admin's Assigned Learning Paths ──
  const { data: myLearningPathsData, isLoading: pathsLoading } = useAdminLearningPaths("JOB");
  const myLearningPaths = myLearningPathsData?.data || [];

  // ── Queries: Jobs for selected Learning Path ──
  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch,
  } = useJobsByLearningPath(selectedLP?.id, {
    status: filter !== "ALL" ? filter : undefined,
    search: debouncedSearch || undefined,
  });

  const { data: recommendedData } = useRecommendedJobs();

  // ── Mutations ──
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const changeStatus = useChangeJobStatus();

  // ── Derived ──
  const allJobs = jobsData?.data || [];
  const recommendedJobs = recommendedData?.data || recommendedData || [];

  // We rely on backend for filtering and searching to handle pagination correctly
  const filteredJobs = allJobs;

  // ✅ Stats بناءً على الـ filteredJobs (أو allJobs لو عايز الـ total يفضل ثابت)
  const stats = useMemo(() => ({
    total: filteredJobs.length,
    published: filteredJobs.filter((j) => j.status === "PUBLISHED").length,
    draft: filteredJobs.filter((j) => j.status === "DRAFT").length,
    closed: filteredJobs.filter((j) => j.status === "CLOSED").length,
  }), [filteredJobs]);

  // Auto-select first learning path
  useEffect(() => {
    if (myLearningPaths.length > 0 && !selectedLP) {
      setSelectedLP(myLearningPaths[0]);
    }
  }, [myLearningPaths, selectedLP]);

  // ── Handlers ──
  const handleViewJob = useCallback((job) => {
    setSelectedJob(job);
    setViewModalOpen(true);
  }, []);

  const handleEditJob = useCallback((job) => {
    setSelectedJob(job);
    setEditModalOpen(true);
  }, []);

  const handleDeleteJob = useCallback((job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  }, []);

  const confirmDeleteJob = useCallback(async () => {
    if (!jobToDelete) return;
    try {
      await deleteJobMutation.mutateAsync(jobToDelete.id);
      toast.success("Job deleted successfully");
      setDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete job");
    }
  }, [jobToDelete, deleteJobMutation]);

  const handleStatusChange = useCallback(async (jobId, currentStatus) => {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await changeStatus.mutateAsync({ id: jobId, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    }
  }, [changeStatus]);

  const handleCreateJob = useCallback(async (data) => {
    try {
      await createJobMutation.mutateAsync(data);
      toast.success("Job created successfully");
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create job");
    }
  }, [createJobMutation]);

  const handleUpdateJob = useCallback(async (id, data) => {
    try {
      await updateJobMutation.mutateAsync({ id, data });
      toast.success("Job updated successfully");
      setEditModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      toast.error(err?.message || "Failed to update job");
    }
  }, [updateJobMutation]);

  // ── Table Columns ──
  const columns = useMemo(() => [
    {
      key: "title",
      label: "Job",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{row.title}</p>
          <p className="text-xs text-gray-400 truncate">{row.company}</p>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row) => <span className="text-xs text-gray-500">{row.location || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.deadline ? new Date(row.deadline).toLocaleDateString() : "No deadline"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ], []);

  const actions = useCallback((row) => (
    <div className="flex items-center justify-end gap-0.5">
      <button
        onClick={() => handleViewJob(row)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
        title="View"
      >
        <Eye size={14} />
      </button>
      <button
        onClick={() => handleEditJob(row)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
        title="Edit"
      >
        <Edit3 size={14} />
      </button>
      <button
        onClick={() => handleStatusChange(row.id, row.status)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
        title="Toggle Status"
      >
        <CheckCircle size={14} />
      </button>
      <button
        onClick={() => handleDeleteJob(row)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  ), [handleViewJob, handleEditJob, handleStatusChange, handleDeleteJob]);

  // ── Auth Guard ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdmin(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-100 px-8 py-7 rounded-2xl text-center shadow-sm max-w-sm">
          <Shield size={22} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-base font-bold text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-500 mt-1">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  // ── No Learning Paths Assigned ──
  if (!pathsLoading && myLearningPaths.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] px-4 sm:px-6 py-7 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm max-w-md">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Learning Paths Assigned</h2>
          <p className="text-sm text-gray-500 mb-4">
            You don't have any learning paths assigned for job management. Contact your Super Admin to get access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 sm:px-6 py-7">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2.5 shadow-md shadow-indigo-200">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Jobs Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage jobs for your assigned learning paths
            </p>
          </div>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          disabled={myLearningPaths.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm shadow-indigo-200"
        >
          <Plus size={15} /> Add Job
        </button>
      </motion.div>

      {/* ═══ Learning Path Selector ═══ */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-indigo-500" />
          <span className="text-xs font-medium text-gray-700">Your Assigned Learning Paths</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {myLearningPaths.map((lp) => (
            <button
              key={lp.id}
              onClick={() => setSelectedLP(lp)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedLP?.id === lp.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Layers size={14} />
              {lp.title}
              <span className="text-xs opacity-75">
                ({lp._count?.jobsList || 0} jobs)
              </span>
              {selectedLP?.id === lp.id && (
                <span className="w-2 h-2 bg-white rounded-full ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Jobs" value={stats.total} icon={Briefcase} gradient="bg-indigo-500" />
        <StatCard title="Published" value={stats.published} icon={CheckCircle} gradient="bg-emerald-500" />
        <StatCard title="Draft" value={stats.draft} icon={Clock} gradient="bg-amber-500" />
        <StatCard title="Closed" value={stats.closed} icon={XCircle} gradient="bg-gray-500" />
      </div>

      {/* ═══ Selected LP Info + Assigned Admins ═══ */}
      {selectedLP && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen size={14} className="text-indigo-500" />
              <span>Showing jobs for:</span>
              <span className="font-medium text-gray-900">{selectedLP.title}</span>
            </div>
            {selectedLP.assignedAdmins?.length > 0 && (
              <div className="flex items-center gap-2">
                <Users size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  Assigned Admins: {selectedLP.assignedAdmins.map((a) => a.admin?.name || a.admin?.email).join(", ")}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ Jobs Table ═══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50/50">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full text-xs rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 focus:border-indigo-400 outline-none"
            />
          </div>
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none text-xs rounded-lg border border-gray-200 bg-white py-1.5 pl-7 pr-7 focus:border-indigo-400 outline-none"
            >
              {["ALL", "PUBLISHED", "DRAFT", "CLOSED"].map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          {/* ✅ زرار Reload */}
          <button
            onClick={() => refetch()}
            disabled={jobsLoading || !selectedLP}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50"
            title="Reload jobs"
          >
            <RefreshCw size={12} className={jobsLoading ? "animate-spin" : ""} />
            Reload
          </button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredJobs} // ✅ بعتنا الـ filteredJobs بدل allJobs
          renderActions={actions}
          loading={jobsLoading || pathsLoading}
          emptyMessage={
            debouncedSearch.trim() && filteredJobs.length === 0
              ? `No jobs match "${debouncedSearch}"`
              : selectedLP
              ? `No jobs found in "${selectedLP.title}"`
              : "Select a learning path"
          }
          hoverable
          striped
        />
      </div>

      {/* ═══ Modals ═══ */}
      <JobFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        learningPaths={myLearningPaths}
        onSubmit={handleCreateJob}
        isSubmitting={createJobMutation.isPending}
      />

      <JobFormModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedJob(null); }}
        mode="edit"
        job={selectedJob}
        learningPaths={myLearningPaths}
        onSubmit={handleUpdateJob}
        isSubmitting={updateJobMutation.isPending}
      />

      <JobViewModal
        isOpen={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setSelectedJob(null); }}
        job={selectedJob}
      />

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Delete Job</h3>
                  <p className="text-xs text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Delete <strong>"{jobToDelete?.title}"</strong>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteJob}
                  disabled={deleteJobMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleteJobMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}