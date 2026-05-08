'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useRoleGuard } from '@/app/hooks/useRoleGuard';
import { useCommunity } from '@/app/CONTEXT/CommunityContextRefactored';
import { toast } from 'react-toastify';
import MembersTable from '@/app/components/community/dashboard/MembersTable';
import EmptyState from '@/app/components/community/dashboard/EmptyState';
import { SkeletonTable } from '@/app/components/community/dashboard/LoadingSkeleton';

export default function AdminMembersPage({ params }) {
  const router = useRouter();
  const { slug } = params;
  const { isAllowed, loading: authLoading } = useRoleGuard(['ADMIN', 'SUPER_ADMIN']);

  const {
    currentCommunity,
    loading,
    error,
    fetchAdminCommunityBySlug,
    fetchAdminMembers,
    handleBanMember,
    handleUnbanMember,
    handleRemoveMember,
  } = useCommunity();

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!isAllowed) return;

    const loadData = async () => {
      try {
        await fetchAdminCommunityBySlug(slug);
      } catch (err) {
        toast.error(err?.message || 'Failed to load community');
        router.push('/admin/dashboard/community');
      }
    };

    loadData();
  }, [slug, isAllowed, fetchAdminCommunityBySlug, router]);

  useEffect(() => {
    if (!currentCommunity?.id) return;

    const loadMembers = async () => {
      try {
        const data = await fetchAdminMembers(currentCommunity.id, {
          limit: 100,
        });
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('Failed to load members');
      }
    };

    loadMembers();
  }, [currentCommunity?.id, fetchAdminMembers]);

  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) =>
        filterStatus === 'banned' ? m.isBanned : !m.isBanned
      );
    }

    setFilteredMembers(filtered);
  }, [searchQuery, filterStatus, members]);

  const handleBan = async (memberId) => {
    try {
      await handleBanMember(currentCommunity.id, memberId, 'Banned by admin');
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, isBanned: true } : m))
      );
      toast.success('Member banned successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to ban member');
    }
  };

  const handleUnban = async (memberId) => {
    try {
      await handleUnbanMember(currentCommunity.id, memberId);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, isBanned: false } : m))
      );
      toast.success('Member unbanned successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to unban member');
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await handleRemoveMember(currentCommunity.id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success('Member removed successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove member');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonTable />
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="p-6">
        <EmptyState
          title="Community Not Found"
          action={() => router.push('/admin/dashboard/community')}
          actionLabel="Back to Communities"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => router.push(`/admin/dashboard/community/${slug}`)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Members</h1>
          <p className="text-slate-400 text-sm mt-1">{currentCommunity.name}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700/50 
                       bg-slate-800/50 text-white placeholder-slate-500 
                       focus:border-blue-500/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-700/50 
                       bg-slate-800/50 text-white focus:border-blue-500/50 
                       focus:outline-none transition-colors"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Members ({filteredMembers.length})
          </h2>
        </div>
        <MembersTable
          members={filteredMembers}
          loading={loading}
          onBan={handleBan}
          onUnban={handleUnban}
          onRemove={handleRemove}
          isAdmin={true}
        />
      </motion.div>
    </div>
  );
}
