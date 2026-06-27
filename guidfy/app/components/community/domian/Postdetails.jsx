"use client";

import { usePostById } from "@/app/hooks/useCommunityQuery";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostCard from "@/app/components/community/feed/PostCard";
import { timeAgo } from "@/lib/timeAgo";

export default function PostDetails({ postId, views }) {
  const { data: postRes, isLoading, error: queryError } = usePostById(postId);
  const router = useRouter();

  const post = postRes?.data?.post || postRes?.post || postRes?.data || postRes;

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (queryError) return <p className="text-red-500">{queryError?.message || "An error occurred"}</p>;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* زر الرجوع */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-500 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {post.community?.name || "Community"}
      </button>

      {/* استخدام PostCard بدل UI كامل */}
      <PostCard
        id={post.id || post._id}
        title={post.title}
        excerpt={post.body?.replace(/<[^>]+>/g, "").slice(0, 150)} // تنظيف HTML
        image={post.image}
        tags={post.tags || []}
        author={post.author?.name}
        authorAvatar={post.author?.avatar}
        authorId={post.author?.id || post.author?._id}
        likes={post.likes}
        comments={post.comments?.length || 0}
        views={views || post.views}
        readTime={post.readTime}
        createdAt={timeAgo(post.createdAt)}
        community={post.community?.name}
        communityId={post.community?.id || post.community?._id}
        body={post.body}
        isAuthor={false} // تقدر تعدلها حسب اللوجيك
      />

      {/* المحتوى الكامل */}
      {/* <div
        className="prose prose-invert max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: post.body }}
      /> */}
    </div>
  );
}