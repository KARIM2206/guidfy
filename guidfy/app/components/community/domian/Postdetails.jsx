"use client";

import { usePost } from "@/app/CONTEXT/Postcontext";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostCard from "@/app/components/community/feed/PostCard"; // عدل المسار حسب مشروعك
import { timeAgo } from "@/lib/timeAgo";

export default function PostDetails({views}) {
  const { post, loading, error } = usePost();
  const router = useRouter();

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* زر الرجوع */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/35 hover:text-blue-400 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {post.community?.name || "Community"}
      </button>

      {/* استخدام PostCard بدل UI كامل */}
      <PostCard
        id={post._id}
        title={post.title}
        excerpt={post.body?.replace(/<[^>]+>/g, "").slice(0, 150)} // تنظيف HTML
        image={post.image}
        tags={post.tags || []}
        author={post.author?.name}
        authorAvatar={post.author?.avatar}
        authorId={post.author?._id}
        likes={post.likes}
        comments={post.comments?.length || 0}
        views={post.views}
        readTime={post.readTime}
        createdAt={timeAgo(post.createdAt)}
        community={post.community?.name}
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