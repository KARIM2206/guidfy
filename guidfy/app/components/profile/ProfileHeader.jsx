'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Calendar, Camera, Edit3, Sparkles, Menu
} from 'lucide-react';
import { timeAgo } from '@/lib/timeAgo';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } },
};

const Shimmer = () => <span className="shimmer-line" aria-hidden="true" />;

export default function ProfileHeader({
  name,
  title,
  bio,
  avatar,
  cover,
  joinDate,
  isOwner = false,
  onEditCover,
  onEditAvatar,
  onOpenEditModal,
  onMenuClick,
  isMenuOpen,
}) {
  const [coverHover, setCoverHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const headerRef = useRef(null);
  const avatarInput = useRef(null);
  const coverInputRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const coverOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.4]);

  return (
    <div className="relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .ph-root { font-family: 'DM Sans', sans-serif; }
        .ph-root h1 { font-family: 'Syne', sans-serif; }

        .ph-glass {
          background: rgba(4,8,20,0.72);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .ph-avatar-ring {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #0ea5e9 100%);
        }

        .ph-cover-overlay {
          background: linear-gradient(
            to bottom,
            rgba(4,8,20,0) 0%,
            rgba(4,8,20,0.4) 55%,
            rgba(4,8,20,0.97) 100%
          );
        }

        .shimmer-line {
          display: block;
          height: 1px;
          width: 100%;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.55), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%,100% { opacity: 0; transform: scaleX(0.3); }
          50%      { opacity: 1; transform: scaleX(1);   }
        }

        .ph-edit-btn {
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
        }
        .ph-edit-btn:hover { border-color: rgba(59,130,246,0.45); background: rgba(59,130,246,0.08); transform: translateY(-1px); }
      `}</style>

      {/* Mobile menu button */}
      {!isMenuOpen && (
        <button
          onClick={onMenuClick}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      )}

      <motion.article
        ref={headerRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="ph-root relative rounded-2xl overflow-hidden"
        style={{ background: 'rgba(4,8,20,0.98)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* COVER */}
        <div
          className="relative h-52 md:h-64 overflow-hidden"
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
        >
          <motion.div
            style={{ y: parallaxY, opacity: coverOpacity }}
            className="absolute -inset-4"
          >
            {cover ? (
              <img
                src={`http://localhost:8000${cover}`}
                alt="cover"
                className="w-full h-full object-cover object-center"
                style={{ filter: 'brightness(0.7) saturate(1.15)' }}
              />
            ) : (
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, #04081400 0%, #0c1a40 40%, #080f28 70%, #040810 100%)'
              }}>
                <div className="absolute top-8 left-16 w-72 h-72 rounded-full opacity-25"
                  style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(45px)' }} />
                <div className="absolute -top-4 right-24 w-52 h-52 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(38px)' }} />
                <div className="absolute bottom-0 left-1/2 w-96 h-32 opacity-15"
                  style={{ background: 'radial-gradient(ellipse, #0ea5e9 0%, transparent 70%)', filter: 'blur(32px)' }} />
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',
                  backgroundSize: '48px 48px'
                }} />
              </div>
            )}
          </motion.div>

          <div className="ph-cover-overlay absolute inset-0" />

          {isOwner && (
            <>
              <motion.button
                initial={false}
                animate={{ opacity: coverHover ? 1 : 0, y: coverHover ? 0 : 4 }}
                onClick={() => coverInputRef.current?.click()}
                className="ph-glass absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-xl text-white/90 text-xs font-medium"
              >
                <Camera size={13} /> Edit Cover
              </motion.button>
              <input type="file" ref={coverInputRef} className="hidden" onChange={onEditCover} />
            </>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-blue-400 text-xs font-semibold"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.28)' }}>
            <Sparkles size={11} /> Dev Profile
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 md:px-8 pb-8">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 md:-mt-16">
            <div
              className="relative w-fit"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <div className="ph-avatar-ring p-[3px] rounded-2xl w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
                <div className="rounded-[14px] w-full h-full" style={{ background: '#040810', padding: '3px' }}>
                  <div className="rounded-[11px] w-full h-full overflow-hidden relative" style={{ background: '#0c1a40' }}>
                    {avatar ? (
                      <img src={`http://localhost:8000${avatar}`} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-400"
                        style={{ fontFamily: 'Syne' }}>
                        {name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    {isOwner && (
                      <>
                        <motion.div
                          animate={{ opacity: avatarHover ? 1 : 0 }}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.6)' }}
                          onClick={() => avatarInput.current?.click()}
                        >
                          <Camera size={20} className="text-white" />
                        </motion.div>
                        <input type='file' accept='image/*' className="hidden" ref={avatarInput} onChange={onEditAvatar} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-400 rounded-full border-2"
                style={{ borderColor: '#040810', boxShadow: '0 0 8px rgba(52,211,153,0.65)' }} />
            </div>

            {/* CTA buttons – Edit Profile for owner only */}
            <motion.div variants={stagger.container} initial="hidden" animate="show" className="flex gap-3 pb-1">
              {isOwner && (
                <motion.button
                  variants={stagger.item}
                  onClick={onOpenEditModal}
                  className="ph-edit-btn ph-glass flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70"
                >
                  <Edit3 size={14} /> Edit Profile
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Name & Title */}
          <motion.div variants={stagger.container} initial="hidden" animate="show" className="mt-5 space-y-1">
            <motion.h1
              variants={stagger.item}
              className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {name ?? 'Unknown User'}
            </motion.h1>
            {title && (
              <motion.p variants={stagger.item} className="text-blue-400/90 font-medium text-sm tracking-wide uppercase">
                {title}
              </motion.p>
            )}
            <Shimmer />
            <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
              {joinDate && (
                <span className="flex items-center gap-1.5 text-white/45 text-xs">
                  <Calendar size={12} className="text-blue-500/70" /> Joined {timeAgo(joinDate)}
                </span>
              )}
            </motion.div>
          </motion.div>

          {/* Bio */}
          {bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-5 text-white/60 text-sm leading-relaxed max-w-2xl"
            >
              {bio}
            </motion.p>
          )}

          {/* Divider – no social links anymore */}
          <div className="mt-6 h-px w-full" style={{
            background: 'linear-gradient(90deg, rgba(59,130,246,0.4), rgba(255,255,255,0.05) 60%, transparent)'
          }} />
        </div>
      </motion.article>
    </div>
  );
}