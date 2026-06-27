"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
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
  RefreshCw,
  AlertTriangle,
  Loader,
  Play,
  Square,
  Clock,
  FileText,
  Zap,
  Sparkles,
  TrendingUp,
  Globe,
  BookOpen,
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
  Shield,
  Users,
  BarChart2,
  UserPlus,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import Table from "@/app/components/ui/Table";

import {
  useAllJobsAdmin,
  useImportedJobs,
  useScraperStatus,
  useScraperLogs,
  useScraperHistory,
  useJobsStats,
  useDeleteJob,
  useChangeJobStatus,
  useApproveImportedJob,
  useRejectImportedJob,
  useApproveAllImported,
  useRemoveDuplicates,
  useStartScraper,
  useStopScraper,
  useFetchFromN8N,
  useCreateJob,
  useUpdateJob,
} from "@/app/hooks/useJobsQueries";

import { useAdminLearningPaths, useAssignAdmins } from "@/app/hooks/useLearningPath";
import { getAllUsers } from "@/services/auth";

// ═══════════════════════════════════════════════════
// ROLE HELPERS
// ═══════════════════════════════════════════════════
const isAdmin = (role) => ["ADMIN", "SUPER_ADMIN"].includes(role);
const isSuperAdmin = (role) => role === "SUPER_ADMIN";

// ═══════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════
const StatCard = ({ title, value, icon: Icon, gradient, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${gradient}`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
            trend >= 0
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <TrendingUp size={10} />
          {trend >= 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
  </motion.div>
);

// ═══════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════
const StatusBadge = ({ status }) => {
  const configs = {
    PUBLISHED: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "Published",
    },
    DRAFT: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-400",
      label: "Draft",
    },
    CLOSED: {
      cls: "bg-slate-50 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      label: "Closed",
    },
    EXPIRED: {
      cls: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      label: "Expired",
    },
  };
  const c = configs[status] || configs.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════
// ASSIGN ADMINS MODAL — مُصلّح بالكامل
// ═══════════════════════════════════════════════════
function AssignAdminsModal({
  isOpen,
  onClose,
  learningPath,
  allAdmins,
  assignedAdminIds,
  onAssign,
  isSubmitting,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    if (isOpen && !wasOpen) {
      setSelectedIds(new Set(assignedAdminIds || []));
      setSearchQuery("");
    } else if (!isOpen && wasOpen) {
      setSelectedIds(new Set());
      setSearchQuery("");
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, assignedAdminIds]);

  if (!isOpen || !learningPath) return null;

  const currentAdmins = allAdmins.filter((a) => selectedIds.has(a.id));
  const availableAdmins = allAdmins.filter((a) => !selectedIds.has(a.id));
  const filteredAvailable = availableAdmins.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleRemove = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const selectAll = () => {
    const allFilteredIds = filteredAvailable.map((a) => a.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allFilteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSave = () => {
    const cleanIds = Array.from(selectedIds)
      .filter((id) => id != null)
      .map((id) => Number(id));

    onAssign({
      learningPathId: learningPath.id,
      data: {
        section: "JOB",
        adminIds: cleanIds,
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-xl h-fit max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                  <Users size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Assign Admins for JOB
                  </h3>
                  <p className="text-sm text-gray-500">
                    Learning Path:{" "}
                    <span className="font-medium text-indigo-600">
                      {learningPath.title}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-xl transition-all"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ─── Current Admins ─── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield size={14} className="text-amber-500" />
                    Currently Assigned
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                      {currentAdmins.length}
                    </span>
                  </h4>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {currentAdmins.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 text-gray-400 text-sm bg-gray-50/80 rounded-xl border border-dashed border-gray-200"
                      >
                        <Users
                          size={24}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        No admins assigned yet
                      </motion.div>
                    ) : (
                      currentAdmins.map((admin) => (
                        <motion.div
                          key={admin.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, scale: 0.9 }}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-red-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {admin.avatar ? (
                              <img
                                src={admin.avatar}
                                alt={admin.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                {admin.name?.charAt(0).toUpperCase() || "A"}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {admin.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(admin.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Unassign"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-gray-400 uppercase tracking-wider">
                    Add Admins
                  </span>
                </div>
              </div>

              {/* ─── Available Admins ─── */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search admins..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  {filteredAvailable.length > 0 && (
                    <button
                      onClick={selectAll}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2.5 rounded-xl border border-indigo-200 transition-all whitespace-nowrap"
                    >
                      Select All Found
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-gray-100 bg-gray-50/30">
                  {filteredAvailable.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <Search
                        size={24}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      {searchQuery
                        ? "No matching admins found"
                        : "All admins are assigned"}
                    </div>
                  ) : (
                    filteredAvailable.map((admin) => (
                      <motion.button
                        key={admin.id}
                        layout
                        onClick={() => handleAdd(admin.id)}
                        className="w-full flex items-center gap-3 p-3 text-left transition-all rounded-lg mx-1 my-0.5 hover:bg-white hover:shadow-sm border border-transparent"
                      >
                        <div className="w-5 h-5 rounded-md border-2 border-gray-300 flex items-center justify-center transition-all flex-shrink-0" />
                        {admin.avatar ? (
                          <img
                            src={admin.avatar}
                            alt={admin.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {admin.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {admin.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {admin.email}
                          </p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle size={18} /> Update Assignments
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════
// SCRAPER STATUS CARD
// ═══════════════════════════════════════════════════
const ScraperStatusCard = ({ status, onStart, onStop, isPending }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`relative p-2.5 rounded-xl ${
            status?.isRunning ? "bg-emerald-500" : "bg-gray-100"
          }`}
        >
          <Zap
            size={16}
            className={status?.isRunning ? "text-white" : "text-gray-400"}
          />
          {status?.isRunning && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Scraper Engine
          </h3>
          <p className="text-xs text-gray-500">
            {status?.isRunning
              ? `Running · ${status.currentSource || "scanning..."}`
              : "Idle · ready to start"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status?.isRunning ? (
          <button
            onClick={onStop}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
          >
            {isPending ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <Square size={12} />
            )}
            Stop
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition disabled:opacity-50"
          >
            {isPending ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            Start
          </button>
        )}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════
// JOB FORM MODAL
// ═══════════════════════════════════════════════════
function JobFormModal({
  isOpen,
  onClose,
  mode,
  job,
  learningPaths,
  onSubmit,
  isSubmitting,
}) {
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
        deadline: job.deadline
          ? new Date(job.deadline).toISOString().split("T")[0]
          : "",
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
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">
            {mode === "create" ? "Create New Job" : "Edit Job"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="Job title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="Company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              placeholder="Job description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="City, Country or Remote"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Salary
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                placeholder="e.g. $50k - $70k"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                value={formData.jobType}
                onChange={(e) =>
                  setFormData({ ...formData, jobType: e.target.value })
                }
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Learning Path *
              </label>
              <select
                required
                value={formData.learningPathId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    learningPathId: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              >
                {learningPaths.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
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
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Job"
                : "Update Job"}
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Briefcase size={12} /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <Globe size={12} /> {job.location || "Remote"}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {job.jobType}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">
              Description
            </h4>
            <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Salary</h4>
              <p className="text-xs text-gray-600">
                {job.salary || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">
                Deadline
              </h4>
              <p className="text-xs text-gray-600">
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString()
                  : "No deadline"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">
              Learning Path
            </h4>
            <p className="text-xs text-gray-600">
              {job.learningPath?.title || "Not assigned"}
            </p>
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
// MAIN PAGE — SuperAdminJobsPage
// ═══════════════════════════════════════════════════
export default function SuperAdminJobsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();

  // ── State ──
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [learningPathFilter, setLearningPathFilter] = useState("");
  const [n8nForm, setN8nForm] = useState({ learningPathId: "", jobTitle: "" });
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLPForAssign, setSelectedLPForAssign] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);

  // ── Queries ──
  const { data: jobsData, isLoading: jobsLoading } = useAllJobsAdmin({
    status: filter !== "ALL" ? filter : undefined,
    search: searchQuery || undefined,
    learningPathId: learningPathFilter || undefined,
    limit: 100,
  });

  const { data: importedData, isLoading: importedLoading } = useImportedJobs({ limit: 100 });
  const { data: scraperStatus } = useScraperStatus();
  const { data: scraperLogs } = useScraperLogs({ limit: 50 });
  const { data: scraperHistory } = useScraperHistory({ limit: 10 });
  const { data: statsData } = useJobsStats();
  const { data: learningPathsData, isLoading: lpLoading } = useAdminLearningPaths('JOB');
console.log('LP Raw:', learningPathsData);
console.log('LP Array:', learningPathsData?.data);
  // ── Mutations ──
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const changeStatus = useChangeJobStatus();
  const approveJob = useApproveImportedJob();
  const rejectJob = useRejectImportedJob();
  const approveAll = useApproveAllImported();
  const removeDups = useRemoveDuplicates();
  const startScraper = useStartScraper();
  const stopScraper = useStopScraper();
  const fetchN8N = useFetchFromN8N();
  const assignAdmins = useAssignAdmins();

  // ── Derived ──
  const allJobs = jobsData?.data || jobsData || [];
  const importedJobs = importedData?.data || importedData || [];
  const learningPaths = learningPathsData?.data || learningPathsData || [];
  const stats = statsData?.data || statsData || {};

  const adminJobs = useMemo(
    () => allJobs.filter((j) => !j.source && j.createdBy),
    [allJobs]
  );

  // ── Fetch all admins (مرة واحدة بس) ──
  useEffect(() => {
    let cancelled = false;
    const fetchAdmins = async () => {
      try {
        const res = await getAllUsers({ role: "ADMIN" });
        const users = res?.data ?? res;
        if (!cancelled) {
          setAllAdmins(
            Array.isArray(users)
              ? users.filter((u) => isAdmin(u.role))
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setAllAdmins([]);
        }
      }
    };
    fetchAdmins();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ مُصلّح: نعتمد على permissions الخاصة بـ JOB بدلاً من assignedAdmins القديمة
  const assignedAdminIds = useMemo(() => {
    if (!selectedLPForAssign?.permissions) return [];
    return selectedLPForAssign.permissions
      .filter((p) => p.section === "JOB")
      .map((p) => p.userId)
      .filter((id) => id != null);
  }, [selectedLPForAssign?.permissions]);

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
      toast.success("Job deleted");
      setDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete job");
    }
  }, [jobToDelete, deleteJobMutation]);

  const handleStatusChange = useCallback(
    async (jobId, currentStatus) => {
      const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      try {
        await changeStatus.mutateAsync({ id: jobId, status: newStatus });
        toast.success(`Status → ${newStatus}`);
      } catch (err) {
        toast.error(err?.message || "Failed to update status");
      }
    },
    [changeStatus]
  );

  const handleCreateJob = useCallback(
    async (data) => {
      try {
        await createJobMutation.mutateAsync(data);
        toast.success("Job created");
        setCreateModalOpen(false);
      } catch (err) {
        toast.error(err?.message || "Failed to create job");
      }
    },
    [createJobMutation]
  );

  const handleUpdateJob = useCallback(
    async (id, data) => {
      try {
        await updateJobMutation.mutateAsync({ id, data });
        toast.success("Job updated");
        setEditModalOpen(false);
        setSelectedJob(null);
      } catch (err) {
        toast.error(err?.message || "Failed to update job");
      }
    },
    [updateJobMutation]
  );

  const handleApproveImported = useCallback(
    async (jobId) => {
      try {
        await approveJob.mutateAsync(jobId);
        toast.success("Job approved");
      } catch (err) {
        toast.error(err?.message || "Failed to approve");
      }
    },
    [approveJob]
  );

  const handleRejectImported = useCallback(
    async (jobId) => {
      try {
        await rejectJob.mutateAsync({
          id: jobId,
          reason: "Rejected by admin",
        });
        toast.success("Job rejected");
      } catch (err) {
        toast.error(err?.message || "Failed to reject");
      }
    },
    [rejectJob]
  );

  const handleApproveAll = useCallback(async () => {
    try {
      await approveAll.mutateAsync();
      toast.success("All jobs approved");
    } catch (err) {
      toast.error(err?.message || "Failed to approve all");
    }
  }, [approveAll]);

  const handleRemoveDuplicates = useCallback(async () => {
    try {
      await removeDups.mutateAsync();
      toast.success("Duplicates removed");
    } catch (err) {
      toast.error(err?.message || "Failed to remove duplicates");
    }
  }, [removeDups]);

  const handleStartScraper = useCallback(async () => {
    try {
      await startScraper.mutateAsync({
        sources: ["linkedin", "indeed", "glassdoor"],
      });
      toast.success("Scraper started");
    } catch (err) {
      toast.error(err?.message || "Failed to start scraper");
    }
  }, [startScraper]);

  const handleStopScraper = useCallback(async () => {
    try {
      await stopScraper.mutateAsync();
      toast.success("Scraper stopped");
    } catch (err) {
      toast.error(err?.message || "Failed to stop scraper");
    }
  }, [stopScraper]);

  const handleFetchN8N = useCallback(async () => {
    if (!n8nForm.learningPathId || !n8nForm.jobTitle) {
      toast.error("Please select a Learning Path and enter a Job Title.");
      return;
    }
    try {
      await fetchN8N.mutateAsync(n8nForm);
      toast.success("Jobs fetched from N8N");
      setN8nForm({ learningPathId: "", jobTitle: "" }); // Reset after success
    } catch (err) {
      toast.error(err?.message || "Failed to fetch from N8N");
    }
  }, [fetchN8N, n8nForm]);

  // ✅ مُصلّح: بيستخدم الـ response صح وبينفذ invalidate
  const handleAssignAdmins = useCallback(
    async ({ learningPathId, data }) => {
      try {
        const result = await assignAdmins.mutateAsync({
          learningPathId,
          data,
        });

        // ✅ اعرض تفاصيل الـ diff لو موجودة
        const added = result?.addedAdmins || [];
        const removed = result?.removedAdmins || [];

        if (added.length > 0 || removed.length > 0) {
          toast.success(
            `Admins updated: +${added.length} added, -${removed.length} removed`
          );
        } else {
          toast.success(result?.message || "Admins assigned successfully");
        }

        setAssignModalOpen(false);
        setSelectedLPForAssign(null);
      } catch (err) {
        toast.error(err?.message || "Failed to assign admins");
      }
    },
    [assignAdmins]
  );

  const openAssignModal = useCallback((lp) => {
    setSelectedLPForAssign(lp);
    setAssignModalOpen(true);
  }, []);

  // ── Table Columns ──
  const allJobsColumns = useMemo(
    () => [
      {
        key: "title",
        label: "Job",
        render: (row) => (
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{row.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <BookOpen size={11} className="text-gray-300 shrink-0" />
              <p className="text-xs text-gray-400 truncate">
                {row.learningPath?.title || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "company",
        label: "Company",
        render: (row) => (
          <span className="text-sm text-gray-700 font-medium">
            {row.company}
          </span>
        ),
      },
      {
        key: "location",
        label: "Location",
        render: (row) => (
          <span className="text-xs text-gray-500">
            {row.location || "—"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "createdBy",
        label: "Created By",
        render: (row) => (
          <span className="text-xs text-gray-500">
            {row.createdBy?.name || "—"}
          </span>
        ),
      },
    ],
    []
  );

  const allJobsActions = useCallback(
    (row) => (
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
    ),
    [handleViewJob, handleEditJob, handleStatusChange, handleDeleteJob]
  );

  const importedColumns = useMemo(
    () => [
      {
        key: "title",
        label: "Job",
        render: (row) => (
          <div>
            <p className="font-medium text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-400">{row.externalId || "—"}</p>
          </div>
        ),
      },
      { key: "company", label: "Company" },
      {
        key: "source",
        label: "Source",
        render: (row) => (
          <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
            {row.source || "Unknown"}
          </span>
        ),
      },
      {
        key: "scrapedAt",
        label: "Scraped At",
        render: (row) => (
          <span className="text-xs text-gray-400">
            {row.scrapedAt
              ? new Date(row.scrapedAt).toLocaleString()
              : "N/A"}
          </span>
        ),
      },
    ],
    []
  );

  const importedActions = useCallback(
    (row) => (
      <div className="flex items-center justify-end gap-0.5">
        <button
          onClick={() => handleApproveImported(row.id)}
          disabled={approveJob.isPending}
          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition disabled:opacity-40"
          title="Approve"
        >
          <CheckCircle size={14} />
        </button>
        <button
          onClick={() => handleRejectImported(row.id)}
          disabled={rejectJob.isPending}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-40"
          title="Reject"
        >
          <XCircle size={14} />
        </button>
      </div>
    ),
    [handleApproveImported, handleRejectImported, approveJob.isPending, rejectJob.isPending]
  );

  // ── Auth Guard ──
  if (authLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );

  if (!isAuthenticated || !user || !isSuperAdmin(user.role))
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-100 px-8 py-7 rounded-2xl text-center shadow-sm max-w-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={22} className="text-red-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-500 mt-1">
            Super Admin privileges required.
          </p>
        </div>
      </div>
    );


  // ── Tabs ──
  const tabs = [
    { id: "all", label: "All Jobs", icon: LayoutGrid, count: allJobs.length },
    {
      id: "admin",
      label: "Created by Admin",
      icon: Shield,
      count: adminJobs.length,
    },
    { id: "n8n", label: "N8N & Imported", icon: Globe, count: importedJobs.length },
  ];

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
            <h1 className="text-lg font-bold text-gray-900">
              Jobs Management
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Super Admin · Full system access
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRemoveDuplicates}
            disabled={removeDups.isPending}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={removeDups.isPending ? "animate-spin" : ""}
            />
            Remove Dupes
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
          >
            <Plus size={15} /> Add Job
          </button>
        </div>
      </motion.div>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs ?? allJobs.length}
          icon={Briefcase}
          gradient="bg-indigo-500"
          trend={stats.weeklyGrowth}
        />
        <StatCard
          title="Published"
          value={
            stats.publishedJobs ??
            allJobs.filter((j) => j.status === "PUBLISHED").length
          }
          icon={CheckCircle}
          gradient="bg-emerald-500"
        />
        <StatCard
          title="Pending Import"
          value={importedJobs.length}
          icon={AlertTriangle}
          gradient="bg-amber-500"
        />

      </div>



      {/* ═══ Learning Paths Quick Actions ═══ */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Learning Paths
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Assign admins to manage job sections
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {learningPaths.map((lp) => (
            <div
              key={lp.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {lp.title}
                </p>
                <p className="text-xs text-gray-400">
                  {lp._count?.jobsList || 0} jobs
                </p>
              </div>
              <button
                onClick={() => openAssignModal(lp)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 transition shrink-0"
              >
                <UserPlus size={12} />
                Assign Admins
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Main Card ═══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-100 px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-3.5 text-xs font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.id
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        {activeTab === "all" && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs…"
                className="w-full text-xs rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-none"
              />
            </div>
            <div className="relative">
              <Filter
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none text-xs rounded-lg border border-gray-200 bg-white py-1.5 pl-7 pr-7 focus:border-indigo-400 outline-none"
              >
                {[
                  "ALL",
                  "ACTIVE",
                  "DRAFT",
                  "PUBLISHED",
                  "CLOSED",
                  "INACTIVE",
                  "EXPIRED",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL"
                      ? "All Status"
                      : s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="relative">
              <BookOpen
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={learningPathFilter}
                onChange={(e) => setLearningPathFilter(e.target.value)}
                className="appearance-none text-xs rounded-lg border border-gray-200 bg-white py-1.5 pl-7 pr-7 focus:border-indigo-400 outline-none"
              >
                <option value="">All Learning Paths</option>
                {learningPaths.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* ALL JOBS */}
          {activeTab === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Table
                columns={allJobsColumns}
                data={allJobs}
                renderActions={allJobsActions}
                loading={jobsLoading}
                emptyMessage="No jobs found"
                hoverable
                striped
              />
            </motion.div>
          )}

          {/* ADMIN CREATED JOBS */}
          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Table
                columns={allJobsColumns}
                data={adminJobs}
                renderActions={allJobsActions}
                loading={jobsLoading}
                emptyMessage="No admin created jobs found"
                hoverable
                striped
              />
            </motion.div>
          )}

          {/* N8N & IMPORTED */}
          {activeTab === "n8n" && (
            <motion.div
              key="n8n"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-8 text-center border-b border-gray-100">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe size={24} className="text-indigo-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Fetch Jobs from N8N
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                  Trigger the N8N workflow to scrape jobs from external sources
                  and import them as DRAFT jobs for review.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 max-w-xl mx-auto">
                  <select
                    className="w-full sm:w-1/2 text-sm rounded-xl border border-gray-200 py-2.5 px-3 focus:ring-1 focus:ring-indigo-300 outline-none"
                    value={n8nForm.learningPathId}
                    onChange={(e) => setN8nForm({ ...n8nForm, learningPathId: e.target.value })}
                  >
                    <option value="">Select Learning Path</option>
                    {learningPaths.map((lp) => (
                      <option key={lp.id} value={lp.id}>
                        {lp.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Job Title (e.g. Frontend Developer)"
                    className="w-full sm:w-1/2 text-sm rounded-xl border border-gray-200 py-2.5 px-3 focus:ring-1 focus:ring-indigo-300 outline-none"
                    value={n8nForm.jobTitle}
                    onChange={(e) => setN8nForm({ ...n8nForm, jobTitle: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleFetchN8N}
                  disabled={fetchN8N.isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {fetchN8N.isPending ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {fetchN8N.isPending ? "Fetching…" : "Fetch Now"}
                </button>
              </div>

              {/* IMPORTED JOBS TABLE (Replaces old Imported Tab) */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                <p className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500" />
                  {importedJobs.length} jobs pending review
                </p>
                <button
                  onClick={handleApproveAll}
                  disabled={approveAll.isPending || importedJobs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition disabled:opacity-50"
                >
                  <CheckCircle size={12} />
                  Approve all ({importedJobs.length})
                </button>
              </div>
              <Table
                columns={importedColumns}
                data={importedJobs}
                renderActions={importedActions}
                loading={importedLoading}
                emptyMessage="No imported jobs pending approval"
                hoverable
                striped
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Modals ═══ */}
      <JobFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        learningPaths={learningPaths}
        onSubmit={handleCreateJob}
        isSubmitting={createJobMutation.isPending}
      />

      <JobFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedJob(null);
        }}
        mode="edit"
        job={selectedJob}
        learningPaths={learningPaths}
        onSubmit={handleUpdateJob}
        isSubmitting={updateJobMutation.isPending}
      />

      <JobViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />

      <AssignAdminsModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedLPForAssign(null);
        }}
        learningPath={selectedLPForAssign}
        allAdmins={allAdmins}
        assignedAdminIds={assignedAdminIds} // ← الـ useMemo version
        onAssign={handleAssignAdmins}
        isSubmitting={assignAdmins.isPending}
      />

      {/* ═══ Delete Modal ═══ */}
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
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Delete Job
                  </h3>
                  <p className="text-xs text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  "{jobToDelete?.title}"
                </strong>
                ?
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