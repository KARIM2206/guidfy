"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";

import { useCommunity } from "@/app/CONTEXT/CommuntiyProvider";
import { usePostById, usePostComments } from "@/app/hooks/useCommunityQuery";

import PostDetails from "@/app/components/community/domian/Postdetails";
import CommentList from "@/app/components/community/domian/Commentlist";
import CommentForm from "@/app/components/community/domian/Commentform";

export default function PostPage() {
  const { id: postId } = useParams();
  
  const { data: postRes, isLoading: postLoading } = usePostById(postId);
  const { data: commentsRes, isLoading: commentsLoading } = usePostComments(postId);
  
  const post = postRes?.data?.post || postRes?.post || postRes?.data || postRes;
  const comments = commentsRes?.data?.comments || commentsRes?.comments || commentsRes?.data || commentsRes || [];

  const { fetchViews, addView } = useCommunity();

  const [localViews, setLocalViews] = useState(0);
  const didRun = useRef(false);

  useEffect(() => {
    if (!postId || didRun.current) return;
    didRun.current = true;

    const key = `viewed_post_${postId}`;

    const init = async () => {
      try {
        // 1. fetch views
        const res = await fetchViews(postId, "POST");
        setLocalViews(res?.views);

        // 2. increment مرة واحدة بس
        if (!localStorage.getItem(key)) {
          const inc = await addView({
            targetId: postId,
            targetType: "POST",
          });

          setLocalViews(inc?.views);
          localStorage.setItem(key, Date.now());
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [postId]);

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Post */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <PostDetails views={localViews} postId={postId} />
        </div>

        {/* Comments */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <div className="flex justify-between mb-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Comments
            </h2>

            <span className="text-sm text-gray-500">
              {comments.length}{" "}
              {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          <div className="mb-8 bg-white border rounded-xl p-4 shadow-sm">
            <CommentForm postId={postId} />
          </div>

          <div className="space-y-6">
            <CommentList postId={postId} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}