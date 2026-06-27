// app/community/question/[communityId]/[id]/page.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  Clock,
  MessageSquare,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Bookmark,
  CheckCircle,
  Loader2,
  AlertCircle,
  Send,
  Trash2,
  User,
  RefreshCw,
  Edit2,
} from "lucide-react";
import { useCommunity } from "@/app/CONTEXT/CommuntiyProvider";
import { useAuth } from "@/app/CONTEXT/AuthProvider";
import { useQuestionById, useDeleteQuestion, useUpdateQuestion, useEditAnswer, useDeleteAnswer } from "@/app/hooks/useCommunityQuery";
import CodeBlock from "@/app/components/ui/CodeBlock";
import AnswerModal from "@/app/components/community/feed/AnswerModal";
import Image from "next/image";
import DeleteModel from "@/app/components/admin/dashboard/roadmap/DeleteModel";
import DeleteConfirmModal from "@/app/components/admin/dashboard/jobs/DeleteConfirmModal";

// ─── Date helper ──────────────────────────────────
function timeAgo(d) {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Body parser ──────────────────────────────────
function BodyRenderer({ body }) {
  const [expanded, setExpanded] = useState(false);

  if (!body) return null;

  const segments = [];
  const regex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  let last = 0,
    match;

  while ((match = regex.exec(body)) !== null) {
    if (match.index > last) {
      const t = body.slice(last, match.index).trim();
      if (t) segments.push({ type: "text", content: t });
    }
    segments.push({
      type: "code",
      language: match[1] || "javascript",
      content: match[2].trimEnd(),
    });
    last = match.index + match[0].length;
  }

  if (last < body.length) {
    const t = body.slice(last).trim();
    if (t) segments.push({ type: "text", content: t });
  }

  // ✅ نحسب عدد السطور للنص فقط
  const textContent = segments
    .filter((s) => s.type === "text")
    .map((s) => s.content)
    .join("\n");

  const lines = textContent.split("\n");
  const shouldClamp = lines.length > 8;

  return (
    <div className="space-y-4">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          const displayText =
            !expanded && shouldClamp
              ? lines.slice(0, 8).join("\n")
              : seg.content;

          return (
            <p
              key={i}
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
            >
              {displayText}
            </p>
          );
        }

        return (
          <CodeBlock key={i} code={seg.content} language={seg.language} />
        );
      })}

      {/* 🔥 Show more / less */}
      {shouldClamp && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-blue-600 hover:underline text-sm"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// ─── Author chip ──────────────────────────────────
function AuthorChip({ author, date }) {
  return (
    <div className="flex items-center gap-2.5">
      {author?.avatar ? (
        <div className="w-8 h-8 rounded-full relative  bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center  ring-white dark:ring-gray-800">
          <Image
            src={`http://localhost:8000${author.avatar}`}
            alt={author.name}
            fill
            unoptimized
            className="absolute rounded-full inset-0 object-cover  ring-white dark:ring-gray-800"
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center  ring-white dark:ring-gray-800">
          <User size={14} className="text-white" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
          {author?.name ?? "Unknown"}
        </p>
        {date && (
          <p className="text-[11px] text-gray-400 leading-tight">{date}</p>
        )}
      </div>
    </div>
  );
}

// ─── Vote column ──────────────────────────────────
function VoteCol({ votes, userVote, onUp, onDown }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-10">
     <motion.button
  whileHover={{ scale: 1.15 }}
  whileTap={{ scale: 0.9 }}
  onClick={onUp}
  disabled={userVote === 1}
  className={`p-1.5 rounded-lg transition-colors ${
    userVote === 1
      ? "text-green-500 bg-green-50 cursor-not-allowed"
      : "text-gray-400 hover:text-green-500 hover:bg-green-50"
  }`}
>
  <ChevronUp size={20} />
</motion.button>
     <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
  {votes ?? 0}
</span>
  <motion.button
  whileHover={{ scale: 1.15 }}
  whileTap={{ scale: 0.9 }}
  onClick={onDown}
  disabled={userVote === -1}
  className={`p-1.5 rounded-lg transition-colors ${
    userVote === -1
      ? "text-red-500 bg-red-50 cursor-not-allowed"
      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
  }`}
>
  <ChevronDown size={20} />
</motion.button>
    </div>
  );
}



// ─── Answer card ──────────────────────────────────
function AnswerCard({
  answer,
  communityId,
  questionId,
  isQuestionAuthor,
  currentUserId,
}) {
  const { addVote, fetchVotes } = useCommunity();
  const editAnswerMutation = useEditAnswer();
  const deleteAnswerMutation = useDeleteAnswer();

  const [localVotes, setLocalVotes] = useState(answer.votes ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [voteChange, setVoteChange] = useState(false);
  const [localUserVote, setLocalUserVote] = useState(0);
  const isMyAnswer = answer.author?.id === currentUserId;

  useEffect(() => {
    const fetch = async () => {
      const res = await fetchVotes(answer.id, "ANSWER");
      setLocalVotes(res?.data?.totalVotes ?? 0);
      setLocalUserVote(res?.data?.userVote ?? 0);
    };
    fetch();
  }, [answer.id, voteChange]);

  const handleVote = async (value) => {
    await addVote({
      targetId: answer.id,
      targetType: "ANSWER",
      value,
    });
    setVoteChange(prev => !prev);
  };

  const handleAccept = () => {
    editAnswerMutation.mutate({ communityId, questionId, answerId: answer.id, data: { isAccepted: true } });
  };

  const handleDelete = () => {
    deleteAnswerMutation.mutate({ communityId, questionId, answerId: answer.id }, {
      onSuccess: () => setIsDeleting(false)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden ${
        answer.isAccepted
          ? "border-green-400 dark:border-green-600 shadow-green-100 dark:shadow-green-900/20 shadow-md"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Accepted banner */}
      {answer.isAccepted && (
        <div className="flex items-center gap-2 px-5 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-700">
          <CheckCircle
            size={14}
            className="text-green-600 dark:text-green-400"
          />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            Accepted Answer
          </span>
        </div>
      )}

      <div className="flex gap-4 p-5">
        {/* Votes + accept btn */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
<VoteCol
  votes={localVotes}
  userVote={localUserVote}
  onUp={() => handleVote(1)}
  onDown={() => handleVote(-1)}
/>
          {/* Accept — يظهر بس للـ question owner لو الإجابة مش accepted */}
          {isQuestionAuthor && !answer.isAccepted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAccept}
              disabled={loading}
              title="Mark as accepted answer"
              className="mt-2 p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <CheckCircle size={18} />
            </motion.button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <BodyRenderer body={answer.body} />

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <AuthorChip
              author={answer.author}
              date={timeAgo(answer.createdAt)}
            />
            {/* Delete — يظهر لصاحب الإجابة فقط */}
            {isMyAnswer && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDeleting(true)}
                disabled={deleteAnswerMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={12} /> Delete
              </motion.button>
            )}

            <DeleteModel
              isOpen={isDeleting}
              onClose={() => setIsDeleting(false)}
              confirmDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════
export default function QuestionDetailPage() {
  const { id: questionId } = useParams();
  const router = useRouter();

  const { data: currentQuestionRes, isLoading: loading, error: queryError } = useQuestionById(questionId);
  const currentQuestion = currentQuestionRes?.question || currentQuestionRes?.data?.question || currentQuestionRes?.data || currentQuestionRes;
  const communityId = currentQuestion?.communityId;

  const deleteQuestionMutation = useDeleteQuestion();

  const { addVote, fetchVotes, fetchViews, addView } = useCommunity();
  const { user } = useAuth(); // { id, name, avatar, role }
  
  const [localViews, setLocalViews] = useState(0);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [localVotes, setLocalVotes] = useState(0);
  const [localUserVote, setLocalUserVote] = useState(0);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const updateQuestionMutation = useUpdateQuestion();

  useEffect(() => {
    let interval;
    if (!questionId) return;

    const fetchData = async () => {
      const res = await fetchVotes(questionId, "QUESTION");
      setLocalVotes(res?.data?.totalVotes ?? 0);
      setLocalUserVote(res?.data?.userVote ?? 0);
    };

    fetchData();
    interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [questionId]);

  useEffect(() => {
    if (!questionId) return;
    const key = `viewed_question_${questionId}`;

    const fetch = async () => {
      try {
        const res = await fetchViews(questionId, "QUESTION");
        setLocalViews(res?.views ?? 0);
      } catch (err) {
        console.error(err);
      }
    };

    const incrementView = async () => {
      try {
        const payload = { targetId: questionId, targetType: "QUESTION" };
        const res = await addView(payload);
        setLocalViews(res?.views ?? 0);
        localStorage.setItem(key, Date.now());
      } catch (err) {
        console.error(err);
      }
    };

    const init = async () => {
      await fetch();
      const alreadyViewed = localStorage.getItem(key);
      if (!alreadyViewed) {
        const timer = setTimeout(() => {
          incrementView();
        }, 300);
        return () => clearTimeout(timer);
      }
    };

    init();
  }, [questionId]);

  const handleVote = async (value) => {
    const res = await addVote({
      targetId: questionId,
      targetType: "QUESTION",
      value,
    });
    const change = res.change;
    setLocalVotes(prev => prev + change);
    setLocalUserVote(prev => {
      if (prev === value) return 0;
      if (prev === -value) return value;
      return value;
    });
  };

  useEffect(() => {
    if (currentQuestion) {
      setLocalVotes(currentQuestion.votes ?? 0);
      setEditTitle(currentQuestion.title);
      setEditBody(currentQuestion.body);
    }
  }, [currentQuestion]);

  const handleUpdateQuestion = () => {
    updateQuestionMutation.mutate(
      { communityId, questionId, data: { title: editTitle, body: editBody } },
      { onSuccess: () => setIsEditingQuestion(false) }
    );
  };

  const handleDeleteQuestion = () => {
    if (!communityId || !questionId) return;
    deleteQuestionMutation.mutate({ communityId, questionId }, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  // ── Loading ───────────────────────────────────
  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading question...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────
  if (queryError && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-rose-400" />
        <p className="text-gray-600 dark:text-gray-400">{queryError?.message || "An error occurred"}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
          >
            <RefreshCw size={14} /> Try again
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const q = currentQuestion;
  const isMyQuestion = q.authorId === user?.id;
  const sortedAnswers = [...(q.answers ?? [])].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return (b.votes ?? 0) - (a.votes ?? 0);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className=" px-4 py-8">
        {/* ── Back ────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to questions
        </motion.button>

        {/* ── Stats bar ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 mb-5 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400"
        >
          <span className="flex items-center gap-1.5">
            <Eye size={12} />
            {(q.views ?? 0).toLocaleString()} views
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {timeAgo(q.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare size={12} />
            {sortedAnswers.length} answers
          </span>
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            <TrendingUp size={12} />
            {localVotes} votes
          </span>
          {q.isAnswered && (
            <span className="ml-auto flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle size={12} /> Answered
            </span>
          )}
        </motion.div>

        {/* ── Question card ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
        >
          <div className="flex gap-4 p-6">
            {/* Votes + bookmark */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <VoteCol
  votes={localVotes}
  userVote={localUserVote}
  onUp={() => handleVote(1)}
  onDown={() => handleVote(-1)}
/>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBookmarked((v) => !v)}
                className={`mt-2 p-1.5 rounded-lg transition-colors ${bookmarked ? "text-yellow-500" : "text-gray-300 dark:text-gray-600 hover:text-yellow-500"}`}
              >
                <Bookmark
                  size={16}
                  fill={bookmarked ? "currentColor" : "none"}
                />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Community pill */}
              <span className="inline-block mb-3 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {q.community?.name ?? `Community #${q.communityId}`}
              </span>

              {isEditingQuestion ? (
                <div className="mb-4">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xl font-bold text-gray-900 dark:text-white mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-2 min-h-[150px]"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateQuestion} disabled={updateQuestionMutation.isPending} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save</button>
                    <button onClick={() => setIsEditingQuestion(false)} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-4">
                    {q.title}
                  </h1>
                  <BodyRenderer body={q.body} />
                </>
              )}

              {/* Tags */}
              {q.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer: author + actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <AuthorChip
                  author={q.author}
                  date={`Asked ${timeAgo(q.createdAt)}`}
                />
                {/* Delete — بس لصاحب السؤال */}
                {isMyQuestion && (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditingQuestion(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsDeletingQuestion(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Answers ─────────────────────────────── */}
          {/* Answer Action */}
          <div className="flex items-center justify-between mt-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              {sortedAnswers.length} Answers
            </h2>
            <button
              onClick={() => setShowAnswerModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Answer
            </button>
          </div>

          <AnswerModal 
            isOpen={showAnswerModal} 
            onClose={() => setShowAnswerModal(false)} 
            questionId={questionId} 
            communityId={communityId} 
          />

          {sortedAnswers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <MessageSquare size={36} strokeWidth={1.5} />
              <p className="text-sm">No answers yet — be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAnswers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  communityId={currentQuestion.communityId}
                  questionId={questionId}
                  isQuestionAuthor={isMyQuestion}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
