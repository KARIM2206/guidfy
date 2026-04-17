import api from "./apiProfile";
 // الـ axios instance اللي عندك

// ─── Mock Data (للـ endpoints اللي لسه ما اتعملتش backend) ───

const MOCK_SOCIAL = {
  location: "Cairo, Egypt",
  website: "https://dev.example.com",
  github: "devuser",
  twitter: "devuser",
  linkedin: "devuser",
};

const MOCK_STATS_EXTRA = {
  posts: 89,
  questions: 45,
  answers: 156,
  projects: 12,
  solutions: 245,
};

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "answer", message: "Sarah replied to your question", time: "2h ago", unread: true },
  { id: 2, type: "like",   message: "Mike liked your post about React", time: "5h ago", unread: true },
  { id: 3, type: "follow", message: "New follower: Emma Davis", time: "1d ago", unread: false },
];

// ────────────────────────────────────────────────────────────

/**
 * جلب بيانات البروفايل الكاملة
 * GET /api/profile/users/:username
 */
export const fetchUserProfile = async () => {
  const { data } = await api.get(`/users`);
  const user = data.data;

  // دمج الـ mock data للحقول اللي لسه ما رجعتش من الباك اند
  return {
    ...user,
    // Social links - mock لحد ما تتضاف للـ schema
    location: user.location ?? MOCK_SOCIAL.location,
    website:  user.website  ?? MOCK_SOCIAL.website,
    github:   user.github   ?? MOCK_SOCIAL.github,
    twitter:  user.twitter  ?? MOCK_SOCIAL.twitter,
    linkedin: user.linkedin ?? MOCK_SOCIAL.linkedin,

    // Stats extra - mock لحد ما تتحسب من الباك اند
    stats: {
      ...user.stats,
      posts:     user.stats?.posts     ?? MOCK_STATS_EXTRA.posts,
      questions: user.stats?.questions ?? MOCK_STATS_EXTRA.questions,
      answers:   user.stats?.answers   ?? MOCK_STATS_EXTRA.answers,
      projects:  user.stats?.projects  ?? MOCK_STATS_EXTRA.projects,
      solutions: user.stats?.solutions ?? MOCK_STATS_EXTRA.solutions,
    },

    // Notifications - mock لحد ما تتجهز الـ notification endpoint
    notifications: user.notifications?.length
      ? user.notifications
      : MOCK_NOTIFICATIONS,

    // joinDate - format من createdAt
    joinDate: user.joinDate
      ? new Date(user.joinDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown",
  };
};

/**
 * تحديث بيانات البروفايل
 * PUT /api/profile/users/profile
 */
export const updateProfile = async (profileData) => {
  const { data } = await api.put("/users/profile", profileData);
  return data.data;
};

/**
 * رفع صورة البروفايل (avatar)
 * POST /api/profile/users/avatar
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

/**
 * رفع صورة الغلاف (cover)
 * POST /api/profile/users/cover
 */
export const uploadCover = async (file) => {
  const formData = new FormData();
  formData.append("cover", file);
  const { data } = await api.post("/users/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

/**
 * تعليم كل الإشعارات كمقروءة
 * PUT /api/profile/users/notifications/read
 */
export const markNotificationsRead = async () => {
  const { data } = await api.put("/users/notifications/read");
  return data;
};

/**
 * جلب الإشعارات
 * GET /api/profile/users/notifications
 */
export const fetchNotifications = async () => {
  try {
    const { data } = await api.get("/users/notifications");
    return data.data;
  } catch {
    // fallback mock لحد ما الـ endpoint يتجهز
    return MOCK_NOTIFICATIONS;
  }
};