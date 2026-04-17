"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { usePost } from "@/app/CONTEXT/Postcontext";
import { useAuth } from "@/app/CONTEXT/AuthProvider";
import Image from "next/image";

export default function CommentForm({
  postId,
  parentId = null,
  onCancel,
  placeholder = "Write a comment…",
  autoFocus = false,
}) {
  const { addComment, addingComment } = usePost();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
 const {user}=useAuth()
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return setError("Comment can't be empty.");
    setError("");
    try {
      await addComment(postId, body.trim(), parentId);
      setBody("");
      onCancel?.();
    } catch (err) {
      setError(err.message || "Failed to add comment.");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="mt-3"
    >
      <div className="flex gap-3 items-start">
        {/* Avatar placeholder */}
        {
          user?.avatar?
            <div className="flex-shrink-0 relative w-8 h-8 rounded-full bg-gray-200">
           <Image
                          src={`http://localhost:8000${user?.avatar}`}
                          alt={user.name}
                         fill
                          unoptimized
                          className="rounded-full object-cover absolute left-0 top-0 border border-gray-200"
                        />
                        </div>
                        :
            <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
        }
      
            
        <div className="flex-1">
          {/* Input */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2 mt-2 justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={addingComment || !body.trim()}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
            >
              {addingComment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {parentId ? "Reply" : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}