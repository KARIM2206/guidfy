'use client';
import { createContext, useContext, useState, useCallback } from "react";
import * as communityService from "../../services/community/community"; // تأكد أن المسار صحيح

// ─── Context ──────────────────────────────────────
const CommunityContext = createContext(null);

// ─── Provider ─────────────────────────────────────
export function CommunityProvider({ children }) {
  const [communities, setCommunities]               = useState([]);
  const [currentCommunity, setCurrentCommunity]     = useState(null);
  const [currentCommunityAnalytics, setCurrentCommunityAnalytics] = useState(null);
  const [questions, setQuestions]                   = useState([]);
  const [currentQuestion, setCurrentQuestion]       = useState();
  const [posts, setPosts]                           = useState([]);
  const [pagination, setPagination]                 = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState(null);
  const [openSidebar, setOpenSidebar]               = useState(false);
  const [answers, setAnswers]                       = useState([]);
  const [votes, setVotes]                           = useState(0);
  const [userVote, setUserVote]                     = useState(0);
  const [isCode, setIsCode]                         = useState(false);
  const [feed, setFeed]                             = useState([]);
  const [feedPagination, setFeedPagination]         = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // ─── Helper ──────────────────────────────────────
  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ═══════════════════════════════════════════════
  //  FEED
  // ═══════════════════════════════════════════════
  const fetchGlobalFeed = useCallback((options = {}) =>
    run(async () => {
      const res = await communityService.getGlobalFeed(options);
      if (options.page > 1) {
        setFeed(prev => [...prev, ...res.data]); 
      } else {
        setFeed(res.data); 
      }
      setFeedPagination(res.pagination);
      return res;
    }), [run]);

  // ═══════════════════════════════════════════════
  //  COMMUNITY CRUD
  // ═══════════════════════════════════════════════
  const fetchAllCommunities = useCallback(() =>
    run(async () => {
      const data = await communityService.getAllCommunities();
      setCommunities(data);
      return data;
    }), [run]);

  const fetchCommunityBySlug = useCallback((slug) =>
    run(async () => {
      const data = await communityService.getCommunityBySlug(slug);
      setCurrentCommunity(data);
      return data;
    }), [run]);

  const fetchCommunityAnalyticsById = useCallback((slug) => // تم التعديل ليستقبل slug
    run(async () => {
      const data = await communityService.getCommunityAnalytics(slug);
      setCurrentCommunityAnalytics(data);
      return data;
    }), [run]);

  const addCommunity = useCallback((payload) =>
    run(async () => {
      const { community } = await communityService.createCommunity(payload);
      setCommunities((prev) => [community, ...prev]);
      return community;
    }), [run]);

  const editCommunity = useCallback((slug, payload) => // تم التعديل ليستقبل slug
    run(async () => {
      const { community } = await communityService.updateCommunity(slug, payload);
      setCommunities((prev) =>
        prev.map((c) => (c.slug === slug ? community : c)) // تم التعديل للمقارنة بالـ slug
      );
      if (currentCommunity?.slug === slug) setCurrentCommunity(community);
      return community;
    }), [run, currentCommunity]);

  const removeCommunity = useCallback((slug) => // تم التعديل ليستقبل slug
    run(async () => {
      await communityService.deleteCommunity(slug);
      setCommunities((prev) => prev.filter((c) => c.slug !== slug));
      if (currentCommunity?.slug === slug) setCurrentCommunity(null);
    }), [run, currentCommunity]);

  // ═══════════════════════════════════════════════
  //  JOIN / LEAVE
  // ═══════════════════════════════════════════════
  const join = useCallback((slug) => // تم التعديل ليستقبل slug
    run(async () => {
      const res = await communityService.joinCommunity(slug);
      setCommunities((prev) =>
        prev.map((c) =>
          c.slug === slug
            ? { ...c, isJoined: true, stats: { ...c.stats, members: c.stats.members + 1 } }
            : c
        )
      );
      if (currentCommunity?.slug === slug) {
        setCurrentCommunity((prev) => ({
          ...prev,
          isJoined: true,
          stats: { ...prev.stats, members: prev.stats.members + 1 },
        }));
      }
      return res;
    }), [run, currentCommunity]);

  const leave = useCallback((slug) => // تم التعديل ليستقبل slug
    run(async () => {
      const res = await communityService.leaveCommunity(slug);
      setCommunities((prev) =>
        prev.map((c) =>
          c.slug === slug
            ? { ...c, isJoined: false, stats: { ...c.stats, members: c.stats.members - 1 } }
            : c
        )
      );
      if (currentCommunity?.slug === slug) {
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
  const fetchQuestions = useCallback((slug, options) => // تم التعديل ليستقبل slug
    run(async () => {
      const res = await communityService.getCommunityQuestions(slug, options);
      setQuestions(res.data);
      setPagination(res.pagination);
      return res;
    }), [run]);

  const fetchQuestionById = useCallback((slug, questionId) => // تم التعديل ليستقبل slug
    run(async () => {
      const res = await communityService.getCommunityQuestionById(slug, questionId);
      setCurrentQuestion(res.question);
      return res;
    }), [run]);

  const addQuestion = useCallback((slug, payload) => // تم التعديل ليستقبل slug
    run(async () => {
      const { question } = await communityService.createQuestion(slug, payload);
      setQuestions((prev) => [question, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return question;
    }), [run]);

  const removeQuestion = useCallback((slug, questionId) => // تم التعديل ليستقبل slug
    run(async () => {
      await communityService.deleteQuestion(slug, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }), [run]);

  // ═══════════════════════════════════════════════
  //  ANSWERS
  // ═══════════════════════════════════════════════
  const fetchAnswers = useCallback((slug, questionId) => // تم التعديل ليستقبل slug
    run(async () => {
      const res = await communityService.getAnswers(slug, questionId);
      setAnswers(res.data);
      setPagination(res.pagination);
      return res;
    }), [run]);

  const addAnswer = useCallback((slug, questionId, payload) => // تم التعديل ليستقبل slug
    run(async () => {
      const { answer } = await communityService.createAnswer(slug, questionId, payload);
      setAnswers((prev) => [answer, ...prev]);
      await fetchQuestionById(slug, questionId);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return answer;
    }), [run]);

  const removeAnswer = useCallback((slug, questionId, answerId) => // تم التعديل ليستقبل slug
    run(async () => {
      await communityService.deleteAnswer(slug, questionId, answerId);
      await fetchQuestionById(slug, questionId);
      setAnswers((prev) => prev.filter((a) => a.id !== answerId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }), [run]);

  // ═══════════════════════════════════════════════
  //  VOTES
  // ═══════════════════════════════════════════════
  const fetchVotes = useCallback((targetId, targetType) =>
    run(async () => {
      const res = await communityService.getVotes(targetId, targetType);
      return res;
    }), [run]);

  const addVote = useCallback((payload) =>
    run(async () => {
      const res = await communityService.vote(payload);
      return res; 
    }), [run]);

  // ═══════════════════════════════════════════════
  //  VIEWS
  // ═══════════════════════════════════════════════
  const fetchViews = useCallback((targetId, targetType) =>
    run(async () => {
      const res = await communityService.getView(targetId, targetType);
      return res;
    }), [run]);

  const addView = useCallback((payload) =>
    run(async () => {
      const res = await communityService.incrementView(payload);
      return res; 
    }), [run]);

  // ═══════════════════════════════════════════════
  //  POSTS
  // ═══════════════════════════════════════════════
  const fetchPosts = useCallback((slug, options) => // تم التعديل ليستقبل slug
    run(async () => {
      const res = await communityService.getCommunityPosts(slug, options);
      setPosts(res.data);
      setPagination(res.pagination);
      return res;
    }), [run]);

  const addPost = useCallback((slug, payload) => // تم التعديل ليستقبل slug
    run(async () => {
      const { post } = await communityService.createPost(slug, payload);
      setPosts((prev) => [post, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return post;
    }), [run]);

  const removePost = useCallback((slug, postId) => // تم التعديل ليستقبل slug
    run(async () => {
      await communityService.deletePost(slug, postId);
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