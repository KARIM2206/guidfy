"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { timeAgo } from "@/lib/timeAgo";
import CommentForm from "./Commentform";
import { usePost } from "@/app/CONTEXT/Postcontext";

const DEPTH_INDENT = 28;

export default function CommentItem({ comment, postId, currentUserId, depth = 0 }) {
  const { deleteComment, latestCommentRef } = usePost();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const isOwn = comment.author?.id === currentUserId;
  const hasReplies = comment.replies?.length > 0;
  const maxDepth = 4;

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
    } catch {
      setDeleting(false);
    }
  };
console.log(comment);

  return (
    <motion.div
      ref={comment.isLatest ? latestCommentRef : null}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.25 }}
      style={{ marginLeft: depth > 0 ? DEPTH_INDENT : 0 }}
      className={`relative ${depth > 0 ? "border-l border-gray-200 pl-4" : ""}`}
    >
      {/* Card */}
      <div
        className={`group rounded-xl p-4 border transition ${
          comment.isOptimistic
            ? "bg-blue-50 border-blue-200"
            : isOwn
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-200 hover:shadow-sm"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 relative w-8 h-8 rounded-full bg-gray-200">
            {comment.author?.avatar ? (
              <Image
                src={`http://localhost:8000${comment.author.avatar}`}
                alt={comment.author.name}
               fill
                unoptimized
                className="rounded-full object-cover absolute left-0 top-0 border border-gray-200"
              />
            ) : (
              <div className="w-[34px] h-[34px] rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {comment.author?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">
                {comment.author?.name || "Unknown"}
                {isOwn && (
                  <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </span>

              {comment.author?.title && (
                <span className="text-[11px] text-gray-500 truncate">
                  {comment.author.title}
                </span>
              )}

              <span className="text-[11px] text-gray-400 ml-auto">
                {timeAgo(comment.createdAt)}
              </span>

              {comment.isOptimistic && (
                <span className="text-[10px] text-blue-500">
                  Sending…
                </span>
              )}
            </div>

            {/* Body */}
            <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {comment.body}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-3">
              {depth < maxDepth && !comment.isOptimistic && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
              )}

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                >
                  {showReplies ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </button>
              )}

              {isOwn && !comment.isOptimistic && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-auto flex items-center gap-1 text-[12px] text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <div className="mt-3 ml-[46px]">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${comment.author?.name}…`}
                autoFocus
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {hasReplies && showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}