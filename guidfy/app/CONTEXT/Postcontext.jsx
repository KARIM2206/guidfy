"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} Author
 * @property {number} id
 * @property {string} name
 * @property {string|null} avatar
 * @property {string|null} title
 */

/**
 * @typedef {Object} Comment
 * @property {number} id
 * @property {string} body
 * @property {string} createdAt
 * @property {Author} author
 * @property {number|null} parentId
 * @property {Comment[]} [replies]
 */

/**
 * @typedef {Object} Post
 * @property {number} id
 * @property {string} title
 * @property {string} body
 * @property {string} image
 * @property {Author} author
 * @property {string} createdAt
 * @property {number} likes
 * @property {number} views
 * @property {{ name: string, slug: string, icon: string }} community
 */

// ─── Context ──────────────────────────────────────────────────────────────────
const PostContext = createContext(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Helper: build comment tree from flat list ────────────────────────────────
function buildCommentTree(flatComments) {
  const map = {};
  const roots = [];

  flatComments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  flatComments.forEach((c) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PostProvider({ children, token }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); // tree
  const [flatComments, setFlatComments] = useState([]); // raw flat list
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingComment, setAddingComment] = useState(false);

  const latestCommentRef = useRef(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // ── Fetch Post ──────────────────────────────────────────────────────────────
  const fetchPost = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
          headers: headers(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch post");
        setPost(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  // ── Fetch Comments ──────────────────────────────────────────────────────────
  const fetchComments = useCallback(
    async (postId) => {
      setCommentsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
          headers: headers(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setFlatComments(data.data);
        setComments(buildCommentTree(data.data));
      } catch (err) {
        console.error("fetchComments error:", err.message);
      } finally {
        setCommentsLoading(false);
      }
    },
    [headers]
  );

  // ── Add Comment / Reply ─────────────────────────────────────────────────────
  const addComment = useCallback(
    async (postId, body, parentId = null) => {
      setAddingComment(true);

      // Optimistic update
      const tempId = Date.now();
      const optimistic = {
        id: tempId,
        body,
        createdAt: new Date().toISOString(),
        parentId,
        author: { id: 0, name: "You", avatar: null, title: null },
        replies: [],
        isOptimistic: true,
      };

      const updatedFlat = [...flatComments, optimistic];
      setFlatComments(updatedFlat);
      setComments(buildCommentTree(updatedFlat));

      try {
        const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ body, parentId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Replace optimistic with real
        const confirmed = data.data;
        const finalFlat = updatedFlat.map((c) =>
          c.id === tempId ? { ...confirmed, replies: [] } : c
        );
        setFlatComments(finalFlat);
        setComments(buildCommentTree(finalFlat));

        // Scroll to new comment
        setTimeout(() => {
          latestCommentRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        // Rollback
        const rolled = flatComments.filter((c) => c.id !== tempId);
        setFlatComments(rolled);
        setComments(buildCommentTree(rolled));
        throw err;
      } finally {
        setAddingComment(false);
      }
    },
    [flatComments, headers]
  );

  // ── Delete Comment ──────────────────────────────────────────────────────────
  const deleteComment = useCallback(
    async (commentId) => {
      const prev = [...flatComments];
      const updated = flatComments.filter((c) => c.id !== commentId);
      setFlatComments(updated);
      setComments(buildCommentTree(updated));

      try {
        const res = await fetch(`${API_BASE}/comments/${commentId}`, {
          method: "DELETE",
          headers: headers(),
        });
        if (!res.ok) throw new Error("Delete failed");
      } catch (err) {
        setFlatComments(prev);
        setComments(buildCommentTree(prev));
        throw err;
      }
    },
    [flatComments, headers]
  );

  return (
    <PostContext.Provider
      value={{
        post,
        comments,
        loading,
        commentsLoading,
        error,
        addingComment,
        latestCommentRef,
        fetchPost,
        fetchComments,
        addComment,
        deleteComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export const usePost = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePost must be used inside PostProvider");
  return ctx;
};