'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  Code2,
  Database,
  Smartphone,
  Cloud,
  Shield,
  TrendingUp,
  Star,
  Users,
  BookOpen,
  PlusCircle,
  Globe,
  Loader2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import CreateCommunityModal from './CreateCommunityModal';
import Link from 'next/link';

// ─── icon map حسب اسم الكميونتى ──────────────────
const ICON_MAP = {
  frontend:     Code2,
  backend:      Database,
  mobile:       Smartphone,
  devops:       Cloud,
  security:     Shield,
  'ai/ml':      TrendingUp,
  'ai-ml':      TrendingUp,
  fullstack:    Globe,
  blockchain:   Shield,
  'data science': TrendingUp,
  'data-science': TrendingUp,
};

function getCommunityIcon(name = '') {
  const key = name.toLowerCase();
  return ICON_MAP[key] || Hash;
}

function formatCount(num) {
  if (!num && num !== 0) return null;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

// ─── Popular Tags (static — يمكن تعملها API لاحقاً) ──
const POPULAR_TAGS = [
  { id: 1, name: 'react',      count: 1245 },
  { id: 2, name: 'nextjs',     count: 890  },
  { id: 3, name: 'tailwind',   count: 567  },
  { id: 4, name: 'typescript', count: 1234 },
  { id: 5, name: 'nodejs',     count: 978  },
  { id: 6, name: 'python',     count: 1567 },
  { id: 7, name: 'docker',     count: 845  },
  { id: 8, name: 'kubernetes', count: 623  },
];

const QUICK_LINKS = [
  { icon: Users,      label: 'Top Contributors', path: '/community/contributors' },
  { icon: BookOpen,   label: 'Documentation',    path: '/docs'                   },
  { icon: TrendingUp, label: 'Trending',          path: '/community/trending'    },
  { icon: Star,       label: 'Featured',          path: '/community/featured'    },
];

// ═══════════════════════════════════════════════════
//  SIDEBAR CONTENT  (shared between mobile & desktop)
// ═══════════════════════════════════════════════════
function SidebarContent({ onClose ,isAdmin,setModalOpen }) {
  const router   = useRouter();
  const pathname = usePathname();

  const {
    communities,
    loading,
    error,
    fetchAllCommunities,
    join,
    leave,
    openSidebar,
    setOpenSidebar,
  } = useCommunity();

  // جلب الكميونتيز عند أول render
  useEffect(() => {
    fetchAllCommunities();
  }, []);

  const handleCommunityClick = (community) => {
    router.push(`/community/${community.slug}`);
    onClose?.();
  };

  const handleTagClick = (tagName) => {
    router.push(`/community/search?q=${encodeURIComponent(tagName)}&type=tag`);
    onClose?.();
  };

  const handleCreateCommunity = () => {
    router.push('/community/create');
    onClose?.();
  };

  const isActive = (slug) => pathname === `/community/${slug}`;
  const isAllActive = pathname === '/community/feed';

  return (
    <div className="p-6">

      {/* ── Communities Section ──────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Communities
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {communities.length > 0 ? `${communities.length} total` : ''}
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-2 py-4 text-red-400">
            <AlertCircle size={20} />
            <span className="text-xs text-center">{error}</span>
            <button
              onClick={fetchAllCommunities}
              className="text-xs text-blue-500 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Communities list */}
        {!loading && !error && (
          <ul className="space-y-1">
            {/* All Communities */}
            <motion.li whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => { router.push('/community/feed'); onClose?.(); }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                  isAllActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Home size={18} />
                  <span className="text-sm font-medium">All Communities</span>
                </div>
              </button>
            </motion.li>

            {/* Real communities from API */}
            {communities.map((community) => {
              const Icon     = getCommunityIcon(community.name);
              const active   = isActive(community.slug);
              const count    = formatCount(community.stats?.members);

              return (
                <motion.li
                  key={community.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/community/${community.slug}`}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* icon أو emoji */}
                      {community.icon ? (
                        <span className="text-base leading-none">{community.icon}</span>
                      ) : (
                        <Icon size={18} />
                      )}
                      <span className="text-sm font-medium truncate">{community.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Joined badge */}
                      {community.isJoined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
                          Joined
                        </span>
                      )}
                      {/* Members count */}
                      {count && (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          active
                            ? 'bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.li>
              );
            })}

            {/* Empty state */}
            {!loading && communities.length === 0 && (
              <li className="text-center py-6 text-gray-400 text-sm">
                No communities yet
              </li>
            )}
          </ul>
        )}
      </div>

      {/* ── Create Community Button ──────────────── */}
    { isAdmin && <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setModalOpen(true)}
        className="w-full mb-8 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
      >
        <PlusCircle size={18} />
        <span>Create Community</span>
      </motion.button>}

      {/* ── Popular Tags ─────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Popular Tags
          </h3>
          <Star size={14} className="text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => (
            <motion.button
              key={tag.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTagClick(tag.name)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors group"
            >
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                #{tag.name}
              </span>
              <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                {tag.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Quick Links ──────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Quick Links
        </h3>
        <div className="space-y-2">
          {QUICK_LINKS.map((link, index) => (
            <motion.button
              key={index}
              onClick={() => { router.push(link.path); onClose?.(); }}
              whileHover={{ x: 4 }}
              className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded-lg transition-colors w-full text-left"
            >
              <link.icon size={16} />
              <span className="text-sm">{link.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── User Stats ───────────────────────────── */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Joined Communities</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {communities.filter((c) => c.isJoined).length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Total Communities</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {communities.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════
export default function CommunitySidebar() {
  const { openSidebar, setOpenSidebar } = useCommunity();
 const { user } = useAuth();
const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
const [modalOpen, setModalOpen] = useState(false); // [setModalOpen]
  return (
    <>
      {/* ── Mobile Sidebar ────────────────────────── */}
      <AnimatePresence>
        {openSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setOpenSidebar(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 z-50 overflow-y-auto lg:hidden"
            >
              <SidebarContent onClose={() => setOpenSidebar(false)} isAdmin={isAdmin} setModalOpen={setModalOpen} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ───────────────────────── */}
      <aside className="hidden lg:flex lg:w-64 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <SidebarContent isAdmin={isAdmin} setModalOpen={setModalOpen} />
      </aside>
      <CreateCommunityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}