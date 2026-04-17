"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import CommentItem from "./Commentitem";
import { usePost } from "@/app/CONTEXT/Postcontext";

export default function CommentList({ postId, currentUserId }) {
  const { comments, commentsLoading } = usePost();

  // 🔄 Loading State
  if (commentsLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        <span className="text-sm text-gray-500">
          Loading comments…
        </span>
      </div>
    );
  }

  // 😴 Empty State
  if (!comments.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-16 gap-3 text-gray-400"
      >
        <div className="p-3 rounded-full bg-blue-50">
          <MessageSquare
            className="w-8 h-8 text-blue-500"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-sm">
          No comments yet. Be the first!
        </p>
      </motion.div>
    );
  }

  // 💬 Comments List
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      className="space-y-4"
    >
      <AnimatePresence>
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <CommentItem
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              depth={0}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}