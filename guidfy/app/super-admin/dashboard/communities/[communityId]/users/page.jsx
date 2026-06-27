'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Ban, UserX, Loader } from 'lucide-react';
import { useCommunityMembers, useBanMember, useUnbanMember } from '@/app/hooks/useCommunityMembers';
import { useAuthStore } from '@/lib/stores/authStore';
import { Pagination, ConfirmModal, Avatar } from '@/app/components/shared/DashboardCard';
import Table from '@/app/components/ui/Table';

const isAdmin = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN';

const columns = [
  {
    key: 'user',
    label: 'User',
    render: (row) => (
      <div className="flex items-center gap-2">
        <Avatar src={row.user?.avatar} name={row.user?.name} size={6} />
        <span className="text-sm font-medium text-gray-800">{row.user?.name}</span>
      </div>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    render: (row) => <span className="text-sm text-gray-500">{row.user?.email || '—'}</span>,
  },
  {
    key: 'role',
    label: 'Role',
    render: (row) => (
      <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
        {row.role || 'MEMBER'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
        row.isBanned
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      }`}>
        {row.isBanned ? 'Banned' : 'Active'}
      </span>
    ),
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    render: (row) => <span className="text-xs text-gray-400">{new Date(row.joinedAt).toLocaleDateString()}</span>,
  },
];

export default function CommunityUsersPage() {
  const { communityId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, type: null, userId: null, userName: '' });

  const { data, isLoading, isPlaceholderData } = useCommunityMembers(communityId, page);
  const ban = useBanMember();
  const unban = useUnbanMember();

  const members = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  const handleBanUnban = async () => {
    if (!confirm.userId) return;
    try {
      if (confirm.type === 'ban') {
        await ban.mutateAsync({ communityId, userId: confirm.userId, reason: 'Violated community guidelines' });
      } else {
        await unban.mutateAsync({ communityId, userId: confirm.userId });
      }
      setConfirm({ open: false, type: null, userId: null, userName: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);

  const renderActions = (row) => (
    row.isBanned ? (
      <button
        onClick={() => setConfirm({ open: true, type: 'unban', userId: row.userId || row.id, userName: row.user?.name })}
        className="text-emerald-600 hover:text-emerald-800 text-xs font-medium flex items-center gap-1 ml-auto transition"
      >
        <UserX size={13} /> Unban
      </button>
    ) : (
      <button
        onClick={() => setConfirm({ open: true, type: 'ban', userId: row.userId || row.id, userName: row.user?.name })}
        className="text-amber-600 hover:text-amber-800 text-xs font-medium flex items-center gap-1 ml-auto transition"
      >
        <Ban size={13} /> Ban
      </button>
    )
  );

  // Auth Guard (after all hooks)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdmin(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 px-8 py-6 rounded-2xl text-center">
          <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/super-admin/dashboard/communities" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community Members</h1>
          <p className="text-sm text-gray-500">Manage members and moderation actions</p>
        </div>
      </motion.div>

      {/* Table */}
      <div className={`transition-opacity ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
        <Table
          columns={columns}
          data={members}
          loading={isLoading && members.length === 0}
          emptyMessage="No members found"
          renderActions={renderActions}
          hoverable
        />
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          disabled={isPlaceholderData}
        />
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.type === 'ban' ? `Ban ${confirm.userName}` : `Unban ${confirm.userName}`}
        description={
          confirm.type === 'ban'
            ? 'The user will no longer be able to interact in this community.'
            : 'The user will be allowed to participate again.'
        }
        onConfirm={handleBanUnban}
        onCancel={() => setConfirm({ open: false, type: null, userId: null, userName: '' })}
        loading={ban.isPending || unban.isPending}
        danger={confirm.type === 'ban'}
      />
    </div>
  );
}