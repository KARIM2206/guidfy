'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Users, MessageSquare, HelpCircle,
  ExternalLink, Loader2, SlidersHorizontal, Edit, Trash2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components & Context
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import CreateCommunityModal from '@/app/components/community/CreateCommunityModal';
import Table from '@/app/components/ui/Table'; // مسار مكون الجدول المعاد استخدامه

// Services

import { updateAdminCommunity } from '@/services/community/adminCommonutiy.service'; // سنضيف deleteAdminCommunity
import { refresh } from 'next/cache';

// ─── Color Mapping ───────────────────────────────
const COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  orange: 'bg-orange-100 text-orange-700',
  pink: 'bg-pink-100 text-pink-700',
};

export default function AdminCommunitiesPage() {
  const router = useRouter();
  const { communities, loading, fetchAllCommunities } = useCommunity();

  // UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [actionLoading, setActionLoading] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetch=async()=>{
await  fetchAllCommunities();
    }
   fetch()
  }, [fetchAllCommunities,refresh]);

  // ─── Filter & Sort Logic (same as before) ──────
  const filteredCommunities = useMemo(() => {
    let result = [...communities];

    if (searchQuery.trim()) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'members_high':
        result.sort((a, b) => (b.stats?.members || 0) - (a.stats?.members || 0));
        break;
      case 'members_low':
        result.sort((a, b) => (a.stats?.members || 0) - (b.stats?.members || 0));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return result;
  }, [communities, searchQuery, sortOrder]);

  // ─── Actions ───────────────────────────────────
  const handleView = (slug) => {
    router.push(`community/${slug}`);
  };

  const handleEdit = (community) => {
    setEditingCommunity(community);
    setIsEditModalOpen(true);
  };

  // const handleDelete = async (slug, name) => {
  //   if (!confirm(`Are you sure you want to delete community "${name}"? This action is permanent.`)) return;
  //   setActionLoading(slug);
  //   try {
  //     await deleteAdminCommunity(slug);
  //     await fetchAllCommunities(); // refresh list
  //   } catch (err) {
  //     console.error('Delete failed:', err);
  //     alert('Failed to delete community. Please try again.');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // const handleUpdateSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!editingCommunity) return;
  //   setActionLoading(editingCommunity.slug);
  //   try {
  //     const formData = new FormData(e.target );
  //     const payload = {
  //       name: formData.get('name'),
  //       description: formData.get('description'),
  //       icon: formData.get('icon'),
  //       color: formData.get('color'),
  //     };
  //     await updateAdminCommunity(editingCommunity.slug, payload);
  //     await fetchAllCommunities();
  //     setIsEditModalOpen(false);
  //     setEditingCommunity(null);
  //   } catch (err) {
  //     console.error('Update failed:', err);
  //     alert('Failed to update community.');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // ─── Table Columns Definition ──────────────────
  const columns = [
    {
      key: 'community',
      label: 'Community',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${COLOR_MAP[row.color] || 'bg-gray-100 text-gray-600'}`}>
            {row.icon || '💬'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {row.name}
            </p>
            {row.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (row) => (
        <span className="text-xs font-mono px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
          /{row.slug}
        </span>
      ),
    },
    {
      key: 'members',
      label: 'Members',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300">
          <Users size={14} className="text-gray-400" />
          <span className="font-medium">{row.stats?.members || 0}</span>
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'posts',
      label: 'Posts',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300">
          <MessageSquare size={14} className="text-gray-400" />
          <span className="font-medium">{row.stats?.posts || 0}</span>
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300">
          <HelpCircle size={14} className="text-gray-400" />
          <span className="font-medium">{row.stats?.questions || 0}</span>
        </div>
      ),
      className: 'text-center',
    },
  ];

  // Render actions inside the table (using renderActions prop)
  const renderActions = (row) => (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => handleView(row.slug)}
        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        title="View"
      >
        <ExternalLink size={16} />
      </button>
      <button
        onClick={() => handleEdit(row)}
        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit size={16} />
      </button>
      {/* <button
        onClick={() => handleDelete(row.slug, row.name)}
        disabled={actionLoading === row.slug}
        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
        title="Delete"
      >
        {actionLoading === row.slug ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button> */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Communities
            {!loading && (
              <span className="text-sm font-normal bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full">
                {communities.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and monitor all platform communities
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus size={18} />
          Create Community
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative sm:w-56">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="members_high">Most Members</option>
              <option value="members_low">Least Members</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* REUSABLE TABLE */}
      <Table
        columns={columns}
        data={filteredCommunities}
        renderActions={renderActions}
        loading={loading}
        emptyMessage="No communities found"
        hoverable
        striped
        compact={false}
      />

      {/* CREATE MODAL */}
      <CreateCommunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEdit={true}
        data={editingCommunity}
        setRefresh={setRefresh}
      />

      {/* EDIT MODAL (Inline) */}
      {/* <AnimatePresence>
        {isEditModalOpen && editingCommunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Community</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingCommunity.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingCommunity.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    name="icon"
                    defaultValue={editingCommunity.icon || '💬'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <select
                    name="color"
                    defaultValue={editingCommunity.color || 'blue'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    {Object.keys(COLOR_MAP).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === editingCommunity.slug}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === editingCommunity.slug && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}