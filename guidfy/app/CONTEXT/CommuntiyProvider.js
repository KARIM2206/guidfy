// CommunityContext.jsx
'use client';
import { createContext, useContext, useState, useCallback } from "react";
import {
  getAllCommunities,
  getCommunityBySlug,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityQuestions,
  getCommunityAnalytics,
  createQuestion,
  deleteQuestion,
  getCommunityPosts,
  createPost,
  deletePost,
  getCommunityQuestionById,
  getAnswers,
  createAnswer,
  deleteAnswer,
  getVotes,
  vote,
  getView,
  incrementView,
  getGlobalFeed,
} from "../../services/community";

// ─── Context ──────────────────────────────────────
const CommunityContext = createContext(null);

// ─── Provider ─────────────────────────────────────
export function CommunityProvider({ children }) {
  const [communities, setCommunities]       = useState([]);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [currentCommunityAnalytics, setCurrentCommunityAnalytics] = useState(null);
  const [questions, setQuestions]           = useState([]);
  const [currentQuestion, setCurrentQuestion]           = useState();
  const [posts, setPosts]                   = useState([]);
  const [pagination, setPagination]         = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
 const [openSidebar, setOpenSidebar] = useState(false);
 const [answers, setAnswers] = useState([]);
 const [votes, setVotes] = useState(0);
 const [userVote, setUserVote] = useState(0);
 const [isCode, setIsCode] = useState(false);
 const [feed, setFeed] = useState([]);
const [feedPagination, setFeedPagination] = useState({ 
  page: 1, limit: 10, total: 0, pages: 1 
});
  // ─── Helper ──────────────────────────────────────
  // CommuntiyProvider.js
const run = useCallback(async (fn) => {
  setLoading(true);
  setError(null);
  try {
    const result = await fn();
    return result;
  } catch (err) {
    setError(err.message || "Something went wrong");
    throw err; // ✅
  } finally {
    setLoading(false);
  }
}, []);
const fetchGlobalFeed = useCallback((options = {}) =>
  run(async () => {
    console.log('Fetching feed with options:', options);
    
    const res = await getGlobalFeed(options);
    if (options.page > 1) {

      setFeed(prev => [...prev, ...res.data]); // append للـ load more
    } else {
      console.log('Resetting feed with new data:', res.data);
      
      setFeed(res.data); // reset عند تغيير الفلتر
    }
    setFeedPagination(res.pagination);
    return res;
  }), [run]);
  // ═══════════════════════════════════════════════
  //  COMMUNITY CRUD
  // ═══════════════════════════════════════════════

  const fetchAllCommunities = useCallback(() =>
    run(async () => {
      const data = await getAllCommunities();
      setCommunities(data);
      return data;
    }), [run]);

  const fetchCommunityBySlug = useCallback((slug) =>
    run(async () => {
      const data = await getCommunityBySlug(slug);
      setCurrentCommunity(data);
      return data;
    }), [run]);
  const fetchCommunityAnalyticsById = useCallback((communityId) =>
    run(async () => {
      const data = await getCommunityAnalytics(communityId);
      setCurrentCommunityAnalytics(data);
      return data;
    }), [run]);

  const addCommunity = useCallback((payload) =>
    run(async () => {
      const { community } = await createCommunity(payload);
      setCommunities((prev) => [community, ...prev]);
      return community;
    }), [run]);

  const editCommunity = useCallback((communityId, payload) =>
    run(async () => {
      const { community } = await updateCommunity(communityId, payload);
      setCommunities((prev) =>
        prev.map((c) => (c.id === communityId ? community : c))
      );
      if (currentCommunity?.id === communityId) setCurrentCommunity(community);
      return community;
    }), [run, currentCommunity]);

  const removeCommunity = useCallback((communityId) =>
    run(async () => {
      await deleteCommunity(communityId);
      setCommunities((prev) => prev.filter((c) => c.id !== communityId));
      if (currentCommunity?.id === communityId) setCurrentCommunity(null);
    }), [run, currentCommunity]);

  // ═══════════════════════════════════════════════
  //  JOIN / LEAVE
  // ═══════════════════════════════════════════════

  const join = useCallback((communityId) =>
    run(async () => {
      const res = await joinCommunity(communityId);
      // update isJoined locally
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, isJoined: true, stats: { ...c.stats, members: c.stats.members + 1 } }
            : c
        )
      );
      if (currentCommunity?.id === communityId) {
        setCurrentCommunity((prev) => ({
          ...prev,
          isJoined: true,
          stats: { ...prev.stats, members: prev.stats.members + 1 },
        }));
      }
      return res;
    }), [run, currentCommunity]);

  const leave = useCallback((communityId) =>
    run(async () => {
      const res = await leaveCommunity(communityId);
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, isJoined: false, stats: { ...c.stats, members: c.stats.members - 1 } }
            : c
        )
      );
      if (currentCommunity?.id === communityId) {
        setCurrentCommunity((prev) => ({
          ...prev,
          isJoined: false,
          stats: { ...prev.stats, members: prev.stats.members - 1 },
        }));
      }
      return res;
    }), [run, currentCommunity]);

  // ═══════════════════════════════════════════════
  //  QUESTIONS
  // ═══════════════════════════════════════════════

  const fetchQuestions = useCallback((communityId, options) =>
    run(async () => {
      const res = await getCommunityQuestions(communityId, options);
      setQuestions(res.data);
      setPagination(res.pagination);
      return res;
    }), [run]);
  const fetchQuestionById = useCallback((questionId) =>
    run(async () => {
      const res = await getCommunityQuestionById( questionId );
      setCurrentQuestion(res.question);
      // setPagination(res.pagination);
      return res;
    }), [run]);

  const addQuestion = useCallback((communityId, payload) =>
    run(async () => {
      const { question } = await createQuestion(communityId, payload);
      setQuestions((prev) => [question, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return question;
    }), [run]);

  const removeQuestion = useCallback((communityId, questionId) =>
    run(async () => {
      await deleteQuestion(communityId, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }), [run]);
  // ═══════════════════════════════════════════════
  //  ANSWERS
  // ═══════════════════════════════════════════════

  const fetchAnswers = useCallback((communityId, questionId) =>
    run(async () => {
      const res = await getAnswers(communityId, questionId);
      setAnswers(res.data);
      setPagination(res.pagination);
      return res;
    }), [run]);
  // const fetchQuestionById = useCallback((questionId) =>
  //   run(async () => {
  //     const res = await getCommunityQuestionById( questionId );
  //     setCurrentQuestion(res.question);
  //     // setPagination(res.pagination);
  //     return res;
  //   }), [run]);

  const addAnswer = useCallback((communityId, questionId, payload) =>
    run(async () => {
      const { answer } = await createAnswer(communityId, questionId, payload);
      setAnswers((prev) => [answer, ...prev]);
      await fetchQuestionById(questionId);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return answer;
    }), [run]);

  const removeAnswer = useCallback((communityId, questionId, answerId) =>
    run(async () => {
      await deleteAnswer(communityId, questionId, answerId);
      await fetchQuestionById(questionId);
      setAnswers((prev) => prev.filter((a) => a.id !== answerId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }), [run]);

  // ═══════════════════════════════════════════════
  //  VOTES
  // ═══════════════════════════════════════════════

  const fetchVotes = useCallback((targetId, targetType) =>
    run(async () => {
      const res = await getVotes(targetId, targetType);
     
      return res;
    }), [run]);

const addVote = useCallback((payload) =>
  run(async () => {
    const res = await vote(payload);
    // await fetchVotes(payload.targetId, payload.targetType);
    return res; // رجّع الداتا بس
  }), [run]);
  // ═══════════════════════════════════════════════
  //  VIEWS
  // ═══════════════════════════════════════════════

  const fetchViews = useCallback((targetId, targetType) =>
    run(async () => {
      const res = await getView(targetId, targetType);

      return res;
    }), [run]);

const addView = useCallback((payload) =>
  run(async () => {
    const res = await incrementView(payload);
    // await fetchVotes(payload.targetId, payload.targetType);
    return res; // رجّع الداتا بس
  }), [run]);
  // ═══════════════════════════════════════════════
  //  POSTS
  // ═══════════════════════════════════════════════

  const fetchPosts = useCallback((communityId, options) =>
    run(async () => {
      const res = await getCommunityPosts(communityId, options);
      setPosts(res.data);
      setPagination(res.pagination);
      return res;
    }), [run]);

  const addPost = useCallback((communityId, payload) =>
    run(async () => {
      const { post } = await createPost(communityId, payload);
      setPosts((prev) => [post, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return post;
    }), [run]);

  const removePost = useCallback((communityId, postId) =>
    run(async () => {
      await deletePost(communityId, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }), [run]);

  // ─── Exposed value ───────────────────────────────
  const value = {
    // state
    communities,
    currentCommunity,
    currentCommunityAnalytics,
    questions,
    posts,
    pagination,
    loading,
    error,
    openSidebar,
    setOpenSidebar,
    isCode,
    setIsCode,
    currentQuestion,
    answers,
    votes,
    userVote,
      feed,
      feedPagination,
    // community
    fetchAllCommunities,
    fetchCommunityBySlug,
    addCommunity,
    editCommunity,
    removeCommunity,
    fetchCommunityAnalyticsById,
    // join/leave
    join,
    leave,
    // questions
    fetchQuestions,
    addQuestion,
    removeQuestion,
    fetchQuestionById,

    // posts
    fetchPosts,
    addPost,
    removePost,
    // answers
    fetchAnswers,
    addAnswer,
    removeAnswer,
    // votes
    fetchVotes,
    addVote,
    // views
    fetchViews,
    addView,
    // feed
    fetchGlobalFeed,
fetchGlobalFeed,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

// ─── Custom hook ─────────────────────────────────
export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used inside <CommunityProvider>");
  return ctx;
}