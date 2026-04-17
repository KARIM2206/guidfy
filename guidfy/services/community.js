// community.service.js
import api from "./apiCommunity";

// ═══════════════════════════════════════════════════
//  COMMUNITY CRUD
// ═══════════════════════════════════════════════════

export const getGlobalFeed = ({
  filter = 'all',
  sort = 'latest',
  page = 1,
  limit = 10,
  search = '',
  quickFilter = '',
} = {}) => {
  const params = {
    filter,
    sort,
    page,
    limit,
  };

  if (search) params.search = search;
  if (quickFilter) params.quickFilter = quickFilter;

  return api
    .get('/communities/feed', { params })
    .then((res) => res.data);
};
// GET /communities
export const getAllCommunities = () =>
  api.get("/communities").then((r) => r.data);

// GET /communities/:slug
export const getCommunityBySlug = (slug) =>
  api.get(`/communities/${slug}`).then((r) => r.data);
export const getCommunityAnalytics = (communityId) =>
  api.get(`/communities/${communityId}/analytics`).then((r) => r.data);

// POST /communities  (ADMIN / SUPER_ADMIN)
export const createCommunity = (payload) =>
  api.post("/communities", payload).then((r) => r.data);
// payload: { name, description?, icon?, color? }

// PUT /communities/:communityId  (ADMIN / SUPER_ADMIN)
export const updateCommunity = (communityId, payload) =>
  api.put(`/communities/${communityId}`, payload).then((r) => r.data);

// DELETE /communities/:communityId  (ADMIN / SUPER_ADMIN)
export const deleteCommunity = (communityId) =>
  api.delete(`/communities/${communityId}`).then((r) => r.data);

// ═══════════════════════════════════════════════════
//  JOIN / LEAVE
// ═══════════════════════════════════════════════════

// POST /communities/:communityId/join
export const joinCommunity = (communityId) =>
  api.post(`/communities/${communityId}/join`).then((r) => r.data);

// POST /communities/:communityId/leave
export const leaveCommunity = (communityId) =>
  api.post(`/communities/${communityId}/leave`).then((r) => r.data);

// ═══════════════════════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════════════════════

// GET /communities/:communityId/questions?page=1&limit=10
export const getCommunityQuestions = (communityId, { page = 1, limit = 10 } = {}) =>
  api
    .get(`/communities/${communityId}/questions`, { params: { page, limit } })
    .then((r) => r.data);
export const getCommunityQuestionById = ( questionId) =>
  api
    .get(`/communities/question/${questionId}`)
    .then((r) => r.data);

// POST /communities/:communityId/questions
export const createQuestion = (communityId, payload) =>
  api
    .post(`/communities/${communityId}/questions`, {
      title: payload.title,
      body: payload.body,
      tags: payload.tags ?? [],
    })
    .then((r) => r.data);

// DELETE /communities/:communityId/questions/:questionId
export const deleteQuestion = (communityId, questionId) =>
  api
    .delete(`/communities/${communityId}/questions/${questionId}`)
    .then((r) => r.data);
// ═══════════════════════════════════════════════════
//  ANSWERS
// ═══════════════════════════════════════════════════

// GET /communities/:communityId/questions/:questionId/answers
export const getAnswers = (communityId, questionId) =>
  api
    .get(`/communities/${communityId}/questions/${questionId}/answers`)
    .then((r) => r.data);
// export const getCommunityQuestionById = ( questionId) =>
//   api
//     .get(`/communities/question/${questionId}`)
//     .then((r) => r.data);

// POST /communities/:communityId/questions
export const createAnswer = (communityId, questionId, payload) =>
  api
    .post(`/communities/${communityId}/questions/${questionId}/answers`, {
      body: payload.body
    
    })
    .then((r) => r.data);

// DELETE /communities/:communityId/questions/:questionId
export const deleteAnswer = (communityId, questionId, answerId) =>
  api
    .delete(`/communities/${communityId}/questions/${questionId}/answers/${answerId}`)
    .then((r) => r.data);
// ═══════════════════════════════════════════════════
//  VOTES
// ═══════════════════════════════════════════════════
export const vote = (payload) =>
  api
    .post(`/communities/vote`, payload)
    .then((r) => r.data);

 export const getVotes = (targetId, targetType) =>
  api
    .get(`/communities/target/${targetId}/type/${targetType}/votes`)
    .then((r) => r.data);
export const incrementView = (payload) =>
  api
    .post(`/communities/views`, payload)
    .then((r) => r.data);

 export const getView = (targetId, targetType) =>
  api
    .get(`/communities/target/${targetId}/type/${targetType}/views`)
    .then((r) => r.data);

// ═══════════════════════════════════════════════════
//  POSTS
// ═══════════════════════════════════════════════════

// GET /communities/:communityId/posts?page=1&limit=10
export const getCommunityPosts = (communityId, { page = 1, limit = 10 } = {}) =>
  api
    .get(`/communities/${communityId}/posts`, { params: { page, limit } })
    .then((r) => r.data);

// POST /communities/:communityId/posts
export const createPost = (communityId, payload) =>
  // console.log(communityId, payload);
  
  api
    .post(`/communities/${communityId}/posts`, {
      title: payload.title,
      body: payload.body,
      image: payload.image ?? null,
      tags: payload.tags ?? [],
      readTime: payload.readTime ?? null,
    })
    .then((r) => r.data);

// DELETE /communities/:communityId/posts/:postId
export const deletePost = (communityId, postId) =>
  api
    .delete(`/communities/${communityId}/posts/${postId}`)
    .then((r) => r.data);