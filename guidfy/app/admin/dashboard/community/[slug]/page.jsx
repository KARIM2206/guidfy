'use client';
// app/admin/community/[slug]/page.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Settings, Users, BarChart2, Flag, FileText,
  MessageSquare, Trash2, RefreshCw, Globe, Edit3,
} from 'lucide-react';
import {
  getAdminCommunity, getAdminPosts, getAdminQuestions,
  deletePostByAdmin, deleteQuestionByAdmin,updateAdminCommunity
} from '@/services/community/adminCommonutiy.service';
import {
  StatCard, StatusBadge, EmptyState, LoadingRows,
  Pagination, ConfirmModal, Avatar, SectionCard,
} from '@/app/components/shared/DashboardCard';
import CreateCommunityModal from '@/app/components/community/CreateCommunityModal';
import { refresh } from 'next/cache';

// ═══════════════════════════════════════════════════
//  NAV LINKS
// ═══════════════════════════════════════════════════

// function AdminNavLinks({ slug }) {
//   const links = [
//     { href: `/admin/community/${slug}`,            label: 'Overview',  icon: Globe },
//     { href: `/admin/community/${slug}/members`,    label: 'Members',   icon: Users },
//     { href: `/admin/community/${slug}/analytics`,  label: 'Analytics', icon: BarChart2 },
//     { href: `/admin/community/${slug}/reports`,    label: 'Reports',   icon: Flag },
//   ];
//   return (
//     <div className="mb-8 flex flex-wrap gap-2">
//       {links.map(({ href, label, icon: Icon }) => (
//         <Link key={href} href={href}
//           className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-slate-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
//         >
//           <Icon size={14} /> {label}
//         </Link>
//       ))}
//     </div>
//   );
// }

// ═══════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════

export default function AdminCommunityPage() {
  const { slug } = useParams();
  const router   = useRouter();

  const [community, setCommunity] = useState(null);
  const [posts,     setPosts]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [postsPag,  setPostsPag]  = useState({ page: 1, limit: 5, total: 0, pages: 1 });
  const [quesPag,   setQuesPag]   = useState({ page: 1, limit: 5, total: 0, pages: 1 });
  const [loading,   setLoading]   = useState(true);
  const [confirm,   setConfirm]   = useState({ open: false, type: null, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '', 
    color: '',
    icon: '',
  });
  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.slug) {
      alert('Please fill all required fields');
      return;
    }
    setActionLoading(true);
    try {
      await updateAdminCommunity(slug, formData);
      setEditModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [comm, postsData, questionsData] = await Promise.all([
        getAdminCommunity(slug),
        getAdminPosts(slug, { page: 1, limit: 5 }),
        getAdminQuestions(slug, { page: 1, limit: 5 }),
      ]);
      setCommunity(comm);
      setPosts(postsData.data);
      setPostsPag(postsData.pagination);
      setQuestions(questionsData.data);
      setQuesPag(questionsData.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug,refresh]);

  const openEditModal = () => {
    setEditModal(true);
    setFormData({
      name: community.name,
      description: community.description,
      slug: community.slug,
      color: community.color,
      icon: community.icon,
    });
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'post')     await deletePostByAdmin(slug, confirm.id, 'Removed by admin');
      if (confirm.type === 'question') await deleteQuestionByAdmin(slug, confirm.id, 'Removed by admin');
      setConfirm({ open: false });
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-400">
          <Settings size={20} className="animate-spin" />
          <span className="text-sm">Loading community…</span>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400 text-sm">Community not found or access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{ background: community.color ? `${community.color}33` : '#ffffff11' }}
            >
              {community.icon || '🌐'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{community.name}</h1>
                <StatusBadge status={community.status} />
              </div>
              <p className="text-xs text-slate-400">{community.description}</p>
            </div>
          </div>
          <button onClick={openEditModal}  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-xs text-slate-300 hover:bg-white/10">
            <Edit3 size={13} /> Edit
          </button>
        </div>
      </motion.div>
        <CreateCommunityModal isOpen={editModal} setRefresh={setRefresh} isEdit={true} data={formData}  onClose={() => setEditModal(false)} community={community} />

      {/* Nav */}
      {/* <AdminNavLinks slug={slug} /> */}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Users}         label="Members"   value={community.stats?.members}   color="blue"   delay={0.05} />
        <StatCard icon={FileText}      label="Posts"     value={community.stats?.posts}     color="purple" delay={0.10} />
        <StatCard icon={MessageSquare} label="Questions" value={community.stats?.questions} color="green"  delay={0.15} />
      </div>

      {/* Posts + Questions tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionCard
            title="Recent Posts"
            action={
              <button onClick={fetchAll} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10">
                <RefreshCw size={13} />
              </button>
            }
          >
            {posts.length === 0 ? (
              <EmptyState icon={FileText} title="No posts yet" />
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between gap-3 rounded-xl bg-white/5 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white">{post.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar src={post.author?.avatar} name={post.author?.name} size={5} />
                        <span className="text-xs text-slate-500">{post.author?.name}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirm({ open: true, type: 'post', id: post.id, title: post.title })}
                      className="rounded-lg border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Recent Questions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionCard title="Recent Questions">
            {questions.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No questions yet" />
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-start justify-between gap-3 rounded-xl bg-white/5 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white">{q.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar src={q.author?.avatar} name={q.author?.name} size={5} />
                        <span className="text-xs text-slate-500">{q.author?.name}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-500">{q.answersCount} answers</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirm({ open: true, type: 'question', id: q.id, title: q.title })}
                      className="rounded-lg border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title={`Delete this ${confirm.type}?`}
        description={`"${confirm.title}" will be permanently removed.`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false })}
        loading={actionLoading}
        danger
      />
    </div>
  );
}