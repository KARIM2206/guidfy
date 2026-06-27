'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, addUser, changeUserRole, deleteUser } from '@/services/auth';
import Table from '@/app/components/ui/Table';
import {
  Users, Crown, Shield, GraduationCap, Plus,
  Search, Edit, Trash2, X, Loader, Lock, Mail, User as UserIcon, Lock as LockIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

const isSuperAdmin = (role) => role === 'SUPER_ADMIN';

const ROLE_CONFIG = {
  SUPER_ADMIN: { label: 'Super Admin', icon: Crown, style: 'bg-amber-50 text-amber-600 border-amber-200' },
  ADMIN: { label: 'Admin', icon: Shield, style: 'bg-blue-50 text-blue-600 border-blue-200' },
  INSTRUCTOR: { label: 'Instructor', icon: GraduationCap, style: 'bg-purple-50 text-purple-600 border-purple-200' },
  STUDENT: { label: 'Student', icon: Users, style: 'bg-gray-50 text-gray-600 border-gray-200' }
};

export default function UsersManagementPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [editRoleData, setEditRoleData] = useState('STUDENT');

  // --- Fetching ---
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers(),
    retry: false
  });

  // --- Mutations ---
  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      toast.success('User added successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to add user')
  });

  const editMutation = useMutation({
    mutationFn: changeUserRole,
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUserForEdit(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update role')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUserForDelete(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete user')
  });

  // --- Helpers ---
  const users = usersData?.data?.data || usersData?.data || [];
  
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // --- Handlers ---
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return toast.error('Please fill all required fields');
    addMutation.mutate(formData);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editMutation.mutate({ email: selectedUserForEdit.email, role: editRoleData });
  };

  const handleDeleteSubmit = () => {
    deleteMutation.mutate({ email: selectedUserForDelete.email });
  };

  // --- Table Configuration ---
  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
            {row.name?.charAt(0)?.toUpperCase() || row.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-900 truncate">{row.name || 'No Name'}</span>
            <span className="text-xs text-gray-500 truncate">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => {
        const config = ROLE_CONFIG[row.role] || ROLE_CONFIG.STUDENT;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style}`}>
            <Icon size={12} />
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      sortable: true,
      render: (row) => (
        <span className="text-gray-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  const renderActions = (row) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          setSelectedUserForEdit(row);
          setEditRoleData(row.role);
        }}
        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        title="Edit Role"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => setSelectedUserForDelete(row)}
        className={`p-2 rounded-lg transition-colors ${
          row.id === user?.id 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        }`}
        disabled={row.id === user?.id}
        title={row.id === user?.id ? "Cannot delete yourself" : "Delete User"}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  // --- Auth Guard ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-red-50 border border-red-200 px-8 py-6 rounded-2xl max-w-md text-center shadow-sm">
          <Lock className="w-12 h-12 text-red-400" />
          <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
          <p className="text-red-600 text-sm">Super Admin privileges required to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform users, roles, and system access</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700 w-full sm:w-auto outline-none"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Table
          columns={columns}
          data={filteredUsers}
          loading={usersLoading}
          renderActions={renderActions}
          emptyMessage={
            searchQuery || roleFilter 
              ? "No users found matching your filters." 
              : "No users exist on the platform."
          }
          hoverable
        />
      </motion.div>

      {/* --- ADD USER MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <UserIcon size={18} />
                  </div>
                  Add New User
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-lg p-1 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700 outline-none"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={addMutation.isPending} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm">
                    {addMutation.isPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT ROLE MODAL --- */}
      <AnimatePresence>
        {selectedUserForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForEdit(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Change Role</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedUserForEdit.email}</p>
                </div>
                <button onClick={() => setSelectedUserForEdit(null)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-lg p-1 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select New Role</label>
                  <div className="space-y-2.5">
                    {['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].map(role => {
                      const isSelected = editRoleData === role;
                      return (
                        <label key={role} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-gray-300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                          </div>
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={isSelected}
                            onChange={() => setEditRoleData(role)}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2.5">
                            {(() => {
                              const Icon = ROLE_CONFIG[role]?.icon;
                              return Icon && <Icon size={18} className={isSelected ? 'text-indigo-600' : 'text-gray-400'} />;
                            })()}
                            <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`}>
                              {ROLE_CONFIG[role]?.label || role}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setSelectedUserForEdit(null)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={editMutation.isPending || editRoleData === selectedUserForEdit.role} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm">
                    {editMutation.isPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRM MODAL --- */}
      <AnimatePresence>
        {selectedUserForDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden p-8 text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete User</h3>
              <p className="text-gray-500 text-base mb-8">
                Are you sure you want to permanently delete <span className="font-bold text-gray-900">{selectedUserForDelete.email}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUserForDelete(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm hover:shadow-md"
                >
                  {deleteMutation.isPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}