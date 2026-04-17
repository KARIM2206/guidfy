import api from "./apiCommunity";

export const sendMessageService    = (receiverId, content) =>
  api.post("/chat/messages", { receiverId, content }).then(r => r.data);

export const getConversationService = (userId, page = 1) =>
  api.get(`/chat/messages/${userId}?page=${page}`).then(r => r.data);

export const getInboxService = () =>
  api.get("/chat/inbox").then(r => r.data);