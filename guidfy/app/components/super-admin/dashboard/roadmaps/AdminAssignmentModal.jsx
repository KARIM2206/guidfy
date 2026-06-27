'use client';

// ═══════════════════════════════════════════════════════════
//  Admin Assignment Modal Component
// ═══════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  UserPlus,
  Trash2,
  Shield,
  Plus,
  CheckCircle,
  Users,
  Loader2,
} from 'lucide-react';
import { useAdmins } from '@/app/hooks/useAdmins';
import Button from '@/app/components/ui/Button';

export default function AdminAssignmentModal({
  isOpen,
  onClose,
  roadmap,
  onAssign,
  onRemove,
  isLoading,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ─── Fetch Real Admins ───
  const { data: allAdmins = [], isLoading: adminsLoading } = useAdmins();

  // ─── Derived Data ───
  const assignedAdminIds = useMemo(() => {
    const ids = new Set();
    roadmap?.assignments?.forEach((a) => {
      const id = a.admin?.id ?? a.adminId;
      if (id) ids.add(id);
    });
    return ids;
  }, [roadmap]);

  const currentAdmins = useMemo(() => {
    return (
      roadmap?.assignments
        ?.map((a) => a.admin)
        .filter(Boolean)
        .filter((admin, index, self) => 
          self.findIndex((a) => a?.id === admin?.id) === index
        ) || []
    );
  }, [roadmap]);

  const availableAdmins = useMemo(() => {
    return allAdmins.filter((admin) => !assignedAdminIds.has(admin.id));
  }, [allAdmins, assignedAdminIds]);

  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return availableAdmins;
    const q = searchQuery.toLowerCase();
    return availableAdmins.filter(
      (admin) =>
        admin.name?.toLowerCase().includes(q) ||
        admin.email?.toLowerCase().includes(q)
    );
  }, [availableAdmins, searchQuery]);

  // ─── Handlers ───
  const toggleSelection = (adminId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(adminId)) {
        next.delete(adminId);
      } else {
        next.add(adminId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allIds = filteredAdmins.map((a) => a.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleAssign = () => {
    if (selectedIds.size === 0) return;
    onAssign(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-xl h-fit max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                  <Users size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Manage Admins</h3>
                  <p className="text-sm text-gray-500">
                    {currentAdmins.length} assigned · {availableAdmins.length} available
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
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
                        <Users size={24} className="mx-auto mb-2 text-gray-300" />
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
                                {admin.name?.charAt(0).toUpperCase() || 'A'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {admin.name}
                              </p>
                              <p className="text-xs text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemove(admin.id)}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Remove admin"
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
                {/* Search + Select All */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search admins by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  {filteredAdmins.length > 0 && (
                    <button
                      onClick={selectAll}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2.5 rounded-xl border border-indigo-200 transition-all whitespace-nowrap"
                    >
                      {filteredAdmins.every((a) => selectedIds.has(a.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>

                {/* Admins List */}
                <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-gray-100 bg-gray-50/30">
                  {adminsLoading ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Loading admins...
                    </div>
                  ) : filteredAdmins.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <Search size={24} className="mx-auto mb-2 text-gray-300" />
                      {searchQuery
                        ? 'No matching admins found'
                        : 'All available admins are assigned'}
                    </div>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const isSelected = selectedIds.has(admin.id);
                      return (
                        <motion.button
                          key={admin.id}
                          layout
                          onClick={() => toggleSelection(admin.id)}
                          className={`w-full flex items-center gap-3 p-3 text-left transition-all rounded-lg mx-1 my-0.5 ${
                            isSelected
                              ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                              : 'hover:bg-white hover:shadow-sm border border-transparent'
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle size={14} className="text-white" />}
                          </div>

                          {/* Avatar */}
                          {admin.avatar ? (
                            <img
                              src={admin.avatar}
                              alt={admin.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-500'
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}
                            >
                              {admin.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {admin.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                          </div>

                          {/* Selected Badge */}
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full"
                            >
                              Selected
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>

                {/* Batch Assign Button */}
                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={handleAssign}
                        disabled={isLoading}
                        className="w-full gap-2 py-3 text-base"
                        variant="primary"
                      >
                        <UserPlus size={18} />
                        {isLoading
                          ? 'Assigning...'
                          : `Assign ${selectedIds.size} Admin${selectedIds.size > 1 ? 's' : ''}`}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}