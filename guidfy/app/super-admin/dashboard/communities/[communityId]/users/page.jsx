'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Ban, UserX } from 'lucide-react';
import Link from 'next/link';
import {
  getCommunityMembersSA, banMemberSA, unbanMemberSA
} from '@/services/community/superAdmin.service';
import { Pagination, ConfirmModal, Avatar } from '@/app/components/shared/DashboardCard';
import Table from '@/app/components/ui/Table'; // مسار مكوّن الجدول

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
    render: (row) => row.user?.email || '—',
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
      <span
        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          row.isBanned
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        }`}
      >
        {row.isBanned ? 'Banned' : 'Active'}
      </span>
    ),
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    render: (row) => new Date(row.joinedAt).toLocaleDateString(),
  },
];

export default function SuperAdminCommunityUsers() {
  const { communityId } = useParams();
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, type: null, userId: null, userName: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMembers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getCommunityMembersSA(communityId, { page, limit: 10 });
      setMembers(res.data || []);
      setPagination(res.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => { fetchMembers(1); }, [fetchMembers]);

  const handleBanUnban = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'ban') {
        await banMemberSA(communityId, confirm.userId, 'Violated community guidelines');
      } else {
        await unbanMemberSA(communityId, confirm.userId);
      }
      setConfirm({ open: false });
      fetchMembers(pagination.page);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const renderActions = (row) => (
    row.isBanned ? (
      <button
        onClick={() => setConfirm({ open: true, type: 'unban', userId: row.userId || row.id, userName: row.user?.name })}
        className="text-emerald-600 hover:text-emerald-800 text-xs font-medium flex items-center gap-1 ml-auto transition-colors"
      >
        <UserX size={13} /> Unban
      </button>
    ) : (
      <button
        onClick={() => setConfirm({ open: true, type: 'ban', userId: row.userId || row.id, userName: row.user?.name })}
        className="text-amber-600 hover:text-amber-800 text-xs font-medium flex items-center gap-1 ml-auto transition-colors"
      >
        <Ban size={13} /> Ban
      </button>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-4">
        <Link href="/super-admin/communities" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community Members</h1>
          <p className="text-sm text-gray-500">Manage members and moderation actions</p>
        </div>
      </motion.div>

      {/* Table */}
      <Table
        columns={columns}
        data={members}
        loading={loading}
        emptyMessage="No members found"
        renderActions={renderActions}
        hoverable
        striped={false}
      />

      {/* Pagination */}
      <div className="mt-4">
        <Pagination pagination={pagination} onPageChange={fetchMembers} />
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
        onCancel={() => setConfirm({ open: false })}
        loading={actionLoading}
        danger={confirm.type === 'ban'}
      />
    </div>
  );
}