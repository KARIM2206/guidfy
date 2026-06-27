'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, FileText, HelpCircle, Flag, ScrollText,
  RefreshCw, Ban, UserMinus, UserCheck, Trash2, CheckCircle,
  XCircle, ShieldOff, Activity, BarChart2
} from 'lucide-react';

import { useAuthStore } from '@/lib/stores/authStore';
import {
  useAdminCommunity,
  useAdminMembers,
  useAdminBannedMembers,
  useMemberActions,
  useAdminPosts,
  useDeletePost,
  useAdminQuestions,
  useDeleteQuestion,
  useAdminReports,
  useReportActions,
  useAdminAnalytics,
  useAdminActionLogs,
} from '@/app/hooks/useAdminCommunities';

import {
  StatCard,
  Avatar,
  LoadingRows,
  Pagination,
  ConfirmModal,
  EmptyState,
  StatusBadge,
} from '@/app/components/shared/DashboardCard';

// ─── constants ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'members',   label: 'Members',   icon: Users },
  { key: 'banned',    label: 'Banned',    icon: Ban },
  { key: 'posts',     label: 'Posts',     icon: FileText },
  { key: 'questions', label: 'Questions', icon: HelpCircle },
  { key: 'reports',   label: 'Reports',   icon: Flag },
  { key: 'logs',      label: 'Logs',      icon: ScrollText },
];

const LOG_ACTION_STYLES = {
  DELETE_POST:     'bg-red-100 text-red-700',
  DELETE_QUESTION: 'bg-red-100 text-red-700',
  BAN_MEMBER:      'bg-orange-100 text-orange-700',
  UNBAN_MEMBER:    'bg-emerald-100 text-emerald-700',
  REMOVE_MEMBER:   'bg-amber-100 text-amber-700',
  RESOLVE_REPORT:  'bg-blue-100 text-blue-700',
  DISMISS_REPORT:  'bg-gray-100 text-gray-700',
};

// ─── small helpers ─────────────────────────────────────────────────────────────

function TabButton({ tab, active, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => onClick(tab.key)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon size={15} />
      {tab.label}
    </button>
  );
}

function ActionBtn({ onClick, className, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function TabHeader({ title, onRefresh, isRefreshing }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}

function ReasonInput({ value, onChange, placeholder = 'Reason (optional)' }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full mt-3 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-4 text-gray-700 border-t border-gray-100 ${className}`}>
      {children}
    </td>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── tab: members ──────────────────────────────────────────────────────────────

function MembersTab({ slug }) {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, member }
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching, refetch } = useAdminMembers(slug, page);
  const { ban, unban, remove } = useMemberActions(slug);

  const members = data?.data ?? [];
  const pagination = data?.pagination;

  const closeModal = () => { setModal(null); setReason(''); };

  const handleConfirm = async () => {
    if (!modal) return;
    const { type, member } = modal;
    try {
      if (type === 'ban')    await ban.mutateAsync({ userId: member.id, reason });
      if (type === 'unban')  await unban.mutateAsync({ userId: member.id });
      if (type === 'remove') await remove.mutateAsync({ userId: member.id });
      closeModal();
    } catch {}
  };

  const isMutating = ban.isPending || unban.isPending || remove.isPending;

  const modalTitle =
    modal?.type === 'ban'    ? `Ban ${modal.member?.name ?? ''}` :
    modal?.type === 'unban'  ? `Unban ${modal.member?.name ?? ''}` :
    modal?.type === 'remove' ? `Remove ${modal.member?.name ?? ''}` : '';

  const modalDescription =
    modal?.type === 'ban'    ? 'This member will be banned from the community.' :
    modal?.type === 'unban'  ? 'This member will be unbanned and can participate again.' :
    modal?.type === 'remove' ? 'This member will be permanently removed from the community.' : '';

  return (
    <>
      <TabHeader title="Community Members" onRefresh={refetch} isRefreshing={isFetching} />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Email</Th>
              <Th>Joined</Th>
              <Th>Status</Th>
              <Th>Ban Info</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><LoadingRows rows={6} /></td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={6} className="py-12"><EmptyState icon={Users} title="No members found" /></td></tr>
            ) : members.map(m => (
              <tr key={m.id} className={`transition-colors ${m.isBanned ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'}`}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar src={m.avatar} name={m.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">#{m.id}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-gray-500 text-xs">{m.email}</Td>
                <Td className="text-gray-500 text-xs">{formatDate(m.createdAt)}</Td>
                <Td>
                  <StatusBadge status={m.isBanned ? 'BANNED' : 'ACTIVE'} />
                </Td>

                {/* ── Ban Info column ── */}
                <Td>
                  {m.isBanned ? (
                    <div className="space-y-1 min-w-[160px]">
                      {/* Reason */}
                      <div className="flex items-start gap-1.5">
                        <span className="text-xs font-semibold text-red-500 shrink-0">Reason:</span>
                        <span className="text-xs text-red-700 break-words">
                          {m.banReason || 'No reason provided'}
                        </span>
                      </div>
                      {/* Banned since */}
                      {m.bannedAt && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-400 shrink-0">Since:</span>
                          <span className="text-xs text-gray-500">{formatDate(m.bannedAt)}</span>
                        </div>
                      )}
                      {/* Banned by */}
                      {m.bannedBy && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-400 shrink-0">By:</span>
                          <div className="flex items-center gap-1">
                            <Avatar src={m.bannedBy.avatar} name={m.bannedBy.name} size="xs" />
                            <span className="text-xs text-gray-600">{m.bannedBy.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </Td>

                <Td>
                  <div className="flex items-center gap-2">
                    {m.isBanned ? (
                      <ActionBtn
                        onClick={() => setModal({ type: 'unban', member: m })}
                        disabled={isMutating}
                        className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        Unban
                      </ActionBtn>
                    ) : (
                      <ActionBtn
                        onClick={() => setModal({ type: 'ban', member: m })}
                        disabled={isMutating}
                        className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Ban
                      </ActionBtn>
                    )}
                    <ActionBtn
                      onClick={() => setModal({ type: 'remove', member: m })}
                      disabled={isMutating}
                      className="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    >
                      Remove
                    </ActionBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}

      {/* ── Ban Modal ── */}
      {modal?.type === 'ban' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            {/* Red top bar */}
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative shrink-0">
                  <Avatar src={modal.member?.avatar} name={modal.member?.name} size="md" />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Ban size={10} className="text-white" />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Ban Member</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">{modal.member?.name}</span>
                    <span className="text-gray-400 text-xs ml-1">({modal.member?.email})</span>
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">
                  This member will be <strong>immediately removed</strong> from the community and blocked from rejoining until unbanned.
                </p>
              </div>

              {/* Reason input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  Ban Reason
                  <span className="text-gray-400 font-normal">(recommended)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Repeated violations of community guidelines, spamming, harassment..."
                  rows={3}
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder:text-gray-300 leading-relaxed"
                />
                <p className="text-xs text-gray-400">The reason will be visible in the Banned Members tab and action logs.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={ban.isPending}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                {ban.isPending ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Banning...</>
                ) : (
                  <><Ban size={13} />Ban Member</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Unban Modal ── */}
      {modal?.type === 'unban' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="relative shrink-0">
                  <Avatar src={modal.member?.avatar} name={modal.member?.name} size="md" />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <UserCheck size={10} className="text-white" />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Unban Member</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">{modal.member?.name}</span>
                    <span className="text-gray-400 text-xs ml-1">({modal.member?.email})</span>
                  </p>
                </div>
              </div>

              {/* Current ban info */}
              {(modal.member?.banReason || modal.member?.bannedAt) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Ban Details</p>
                  {modal.member?.bannedAt && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Banned since:</span> {formatDate(modal.member.bannedAt)}
                    </p>
                  )}
                  {modal.member?.banReason && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Reason:</span> {modal.member.banReason}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 leading-relaxed">
                  This member will be <strong>restored</strong> and can rejoin and participate in the community again.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={unban.isPending}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                {unban.isPending ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Unbanning...</>
                ) : (
                  <><UserCheck size={13} />Unban Member</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Remove Modal ── */}
      {modal?.type === 'remove' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-gray-400 to-gray-500" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="relative shrink-0">
                  <Avatar src={modal.member?.avatar} name={modal.member?.name} size="md" />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                    <UserMinus size={10} className="text-white" />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Remove Member</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">{modal.member?.name}</span>
                    <span className="text-gray-400 text-xs ml-1">({modal.member?.email})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <XCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  This member will be <strong>removed</strong> from the community. They can rejoin unless banned.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={remove.isPending}
                className="px-5 py-2 text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                {remove.isPending ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Removing...</>
                ) : (
                  <><UserMinus size={13} />Remove Member</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ─── tab: posts ────────────────────────────────────────────────────────────────

function PostsTab({ slug }) {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching, refetch } = useAdminPosts(slug, page);
  const deleteMutation = useDeletePost(slug);

  const posts = data?.posts ?? [];
  const pagination = data?.pagination;

  const closeModal = () => { setModal(null); setReason(''); };

  const handleDelete = async () => {
    if (!modal) return;
    try {
      await deleteMutation.mutateAsync({ postId: modal.post.id, reason });
      closeModal();
    } catch {}
  };

  return (
    <>
      <TabHeader title="Community Posts" onRefresh={refetch} isRefreshing={isFetching} />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Author</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4}><LoadingRows rows={6} /></td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={4} className="py-12"><EmptyState icon={FileText} title="No posts found" /></td></tr>
            ) : posts.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <Td className="max-w-xs truncate font-medium text-gray-900">{p.title}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar src={p.author?.avatar} name={p.author?.name} size="xs" />
                    <span className="text-gray-600">{p.author?.name}</span>
                  </div>
                </Td>
                <Td className="text-gray-500">{formatDate(p.createdAt)}</Td>
                <Td>
                  <ActionBtn
                    onClick={() => setModal({ post: p })}
                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </ActionBtn>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}

      <ConfirmModal
        open={!!modal}
        title="Delete Post"
        description="This post will be permanently deleted. This action cannot be undone."
        danger
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={closeModal}
      >
        <ReasonInput value={reason} onChange={setReason} placeholder="Reason for deletion (optional)" />
      </ConfirmModal>
    </>
  );
}

// ─── tab: questions ────────────────────────────────────────────────────────────

function QuestionsTab({ slug }) {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching, refetch } = useAdminQuestions(slug, page);
  const deleteMutation = useDeleteQuestion(slug);

  const questions = data?.questions ?? [];
  const pagination = data?.pagination;

  const closeModal = () => { setModal(null); setReason(''); };

  const handleDelete = async () => {
    if (!modal) return;
    try {
      await deleteMutation.mutateAsync({ questionId: modal.question.id, reason });
      closeModal();
    } catch {}
  };

  return (
    <>
      <TabHeader title="Community Questions" onRefresh={refetch} isRefreshing={isFetching} />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Author</Th>
              <Th>Answers</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><LoadingRows rows={6} /></td></tr>
            ) : questions.length === 0 ? (
              <tr><td colSpan={5} className="py-12"><EmptyState icon={HelpCircle} title="No questions found" /></td></tr>
            ) : questions.map(q => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <Td className="max-w-xs truncate font-medium text-gray-900">{q.title}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar src={q.author?.avatar} name={q.author?.name} size="xs" />
                    <span className="text-gray-600">{q.author?.name}</span>
                  </div>
                </Td>
                <Td>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    {q.answersCount ?? 0}
                  </span>
                </Td>
                <Td className="text-gray-500">{formatDate(q.createdAt)}</Td>
                <Td>
                  <ActionBtn
                    onClick={() => setModal({ question: q })}
                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </ActionBtn>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}

      <ConfirmModal
        open={!!modal}
        title="Delete Question"
        description="This question and all its answers will be permanently deleted."
        danger
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={closeModal}
      >
        <ReasonInput value={reason} onChange={setReason} placeholder="Reason for deletion (optional)" />
      </ConfirmModal>
    </>
  );
}

// ─── tab: reports ──────────────────────────────────────────────────────────────

function ReportsTab({ slug }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useAdminReports(slug, page);
  const { resolve, dismiss } = useReportActions();

  const reports = data?.reports ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <TabHeader title="Community Reports" onRefresh={refetch} isRefreshing={isFetching} />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Reporter</Th>
              <Th>Type</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><LoadingRows rows={6} /></td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="py-12"><EmptyState icon={Flag} title="No reports found" /></td></tr>
            ) : reports.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar src={r.reporter?.avatar} name={r.reporter?.name} size="xs" />
                    <span className="text-gray-600">{r.reporter?.name}</span>
                  </div>
                </Td>
                <Td>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {r.type}
                  </span>
                </Td>
                <Td className="max-w-xs truncate text-gray-500 text-xs">{r.reason ?? '—'}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="text-gray-500">{formatDate(r.createdAt)}</Td>
                <Td>
                  {r.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <ActionBtn
                        onClick={() => resolve.mutate({ reportId: r.id, data: {} })}
                        disabled={resolve.isPending}
                        className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        Resolve
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => dismiss.mutate({ reportId: r.id })}
                        disabled={dismiss.isPending}
                        className="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                      >
                        Dismiss
                      </ActionBtn>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}
    </>
  );
}

// ─── tab: banned members ───────────────────────────────────────────────────────

function BannedTab({ slug }) {
  const [page, setPage]     = useState(1);
  const [modal, setModal]   = useState(null); // { type: 'unban', member }
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching, refetch } = useAdminBannedMembers(slug, page);
  const { unban } = useMemberActions(slug);

  const banned     = data?.data       ?? [];
  const pagination = data?.pagination;

  const closeModal = () => { setModal(null); setReason(''); };

  const handleUnban = async () => {
    if (!modal) return;
    try {
      await unban.mutateAsync({ userId: modal.member.id });
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <TabHeader title="Banned Members" onRefresh={refetch} isRefreshing={isFetching} />

      {banned.length > 0 && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <Ban size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">
            {data?.pagination?.total ?? banned.length} member{(data?.pagination?.total ?? banned.length) !== 1 ? 's' : ''} currently banned from this community
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Email</Th>
              <Th>Banned Since</Th>
              <Th>Reason</Th>
              <Th>Banned By</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><LoadingRows rows={5} /></td></tr>
            ) : banned.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <EmptyState icon={Ban} title="No banned members" />
                </td>
              </tr>
            ) : banned.map(m => (
              <tr key={m.id} className="bg-red-50/30 hover:bg-red-50/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar src={m.avatar} name={m.name} size="sm" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Ban size={7} className="text-white" />
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">#{m.id}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-gray-500 text-xs">{m.email}</Td>
                <Td className="text-xs">
                  <span className="text-red-600 font-medium">{formatDate(m.bannedAt)}</span>
                </Td>
                <Td className="max-w-[200px]">
                  {m.reason ? (
                    <p className="text-xs text-gray-700 break-words leading-relaxed">
                      {m.reason}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-300 italic">No reason provided</span>
                  )}
                </Td>
                <Td>
                  {m.bannedBy ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar src={m.bannedBy.avatar} name={m.bannedBy.name} size="xs" />
                      <span className="text-xs text-gray-600">{m.bannedBy.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </Td>
                <Td>
                  <ActionBtn
                    onClick={() => setModal({ type: 'unban', member: m })}
                    disabled={unban.isPending}
                    className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  >
                    Unban
                  </ActionBtn>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}

      <ConfirmModal
        open={!!modal}
        title={`Unban ${modal?.member?.name ?? ''}`}
        description="This member will be unbanned and can rejoin and participate in the community again."
        danger={false}
        loading={unban.isPending}
        onConfirm={handleUnban}
        onCancel={closeModal}
      />
    </>
  );
}

// ─── tab: logs ─────────────────────────────────────────────────────────────────

function LogsTab({ slug }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useAdminActionLogs(slug, page);

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <TabHeader title="Admin Action Logs" onRefresh={refetch} isRefreshing={isFetching} />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Admin</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4}><LoadingRows rows={6} /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="py-12"><EmptyState icon={ScrollText} title="No logs yet" /></td></tr>
            ) : logs.map(l => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar src={l.admin?.avatar} name={l.admin?.name} size="xs" />
                    <span className="font-medium text-gray-700">{l.admin?.name}</span>
                  </div>
                </Td>
                <Td>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${LOG_ACTION_STYLES[l.action] ?? 'bg-gray-100 text-gray-700'}`}>
                    {l.action}
                  </span>
                </Td>
                <Td className="text-gray-500 text-xs font-mono">{l.targetId ?? '—'}</Td>
                <Td className="text-gray-500">{formatDate(l.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}
    </>
  );
}

// ─── main page ─────────────────────────────────────────────────────────────────

export default function AdminCommunityPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isLoading: authLoading } = useAuthStore();

  // ALL hooks before conditional returns
  const activeTab = searchParams.get('tab') ?? 'members';

  const { data: communityData, isLoading: communityLoading } = useAdminCommunity(slug);
  const { data: analyticsData } = useAdminAnalytics(slug);

  const setTab = useCallback((tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // ── auth guard ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role;
  if (!user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <ShieldOff className="mx-auto text-red-400 mb-4" size={40} />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Access Denied</h2>
          <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const community = communityData?.community ?? communityData?.data;
  const analytics = analyticsData?.data;

  const stats = [
    { icon: Users,       label: 'Total Members',   value: analytics?.totalMembers   ?? community?.stats?.members   ?? '—', color: 'blue',   delay: 0 },
    { icon: FileText,    label: 'Total Posts',      value: analytics?.totalPosts     ?? community?.stats?.posts     ?? '—', color: 'violet', delay: 0.05 },
    { icon: HelpCircle,  label: 'Total Questions',  value: analytics?.totalQuestions ?? community?.stats?.questions ?? '—', color: 'amber',  delay: 0.1 },
    { icon: Flag,        label: 'Open Reports',     value: analytics?.openReports                                   ?? '—', color: 'red',    delay: 0.15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {communityLoading ? (
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : community ? (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {community.icon && community.icon.startsWith('http') ? (
                  <img src={community.icon} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : community.icon ? (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-100">
                    {community.icon}
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: community.color?.startsWith('#') ? community.color : undefined }}
                    data-color={community.color}
                  >
                    {community.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900">{community.name}</h1>
                    <StatusBadge status={community.status} />
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">/{community.slug}</p>
                  {community.description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">{community.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Activity size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">Community Admin Panel</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Community not found.</p>
          )}
        </motion.div>

        {/* ── stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.delay, duration: 0.3 }}
            >
              <StatCard icon={s.icon} label={s.label} value={s.value} color={s.color} delay={s.delay} />
            </motion.div>
          ))}
        </div>

        {/* ── tabs ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* tab bar */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max px-2">
              {TABS.map(tab => (
                <TabButton key={tab.key} tab={tab} active={activeTab === tab.key} onClick={setTab} />
              ))}
            </div>
          </div>

          {/* tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="p-6"
            >
              {activeTab === 'members'   && <MembersTab   slug={slug} />}
              {activeTab === 'banned'    && <BannedTab    slug={slug} />}
              {activeTab === 'posts'     && <PostsTab     slug={slug} />}
              {activeTab === 'questions' && <QuestionsTab slug={slug} />}
              {activeTab === 'reports'   && <ReportsTab   slug={slug} />}
              {activeTab === 'logs'      && <LogsTab      slug={slug} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}