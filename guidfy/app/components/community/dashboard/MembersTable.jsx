'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Ban, CheckCircle } from 'lucide-react';
import EmptyState from './EmptyState';

// ═══════════════════════════════════════════════════════════════
//  MembersTable - Display community members with actions
// ═══════════════════════════════════════════════════════════════

export default function MembersTable({
  members = [],
  loading = false,
  onBan,
  onUnban,
  onRemove,
  isSuperAdmin = false,
  isAdmin = false,
}) {
  const [selectedMembers, setSelectedMembers] = useState(new Set());

  const toggleSelect = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  if (!loading && members.length === 0) {
    return <EmptyState title="No Members" description="This community has no members yet" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/50">
      <table className="w-full">
        <thead className="border-b border-slate-700/50 bg-slate-800/50">
          <tr>
            {(isAdmin || isSuperAdmin) && (
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded border-slate-600" />
              </th>
            )}
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
              Member
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
              Status
            </th>
            {(isAdmin || isSuperAdmin) && (
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <motion.tr
              key={member.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
            >
              {(isAdmin || isSuperAdmin) && (
                <td className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(member.id)}
                    onChange={() => toggleSelect(member.id)}
                    className="rounded border-slate-600"
                  />
                </td>
              )}
              <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                    alt={member.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-3">
                <p className="text-sm text-slate-400">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </td>
              <td className="px-6 py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    member.isBanned
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  <CheckCircle className="h-3 w-3" />
                  {member.isBanned ? 'Banned' : 'Active'}
                </span>
              </td>
              {(isAdmin || isSuperAdmin) && (
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {member.isBanned ? (
                      <button
                        onClick={() => onUnban?.(member.id)}
                        className="p-2 rounded hover:bg-slate-700/50 transition-colors text-emerald-400"
                        title="Unban"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onBan?.(member.id)}
                        className="p-2 rounded hover:bg-slate-700/50 transition-colors text-yellow-400"
                        title="Ban"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemove?.(member.id)}
                      className="p-2 rounded hover:bg-slate-700/50 transition-colors text-red-400"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
