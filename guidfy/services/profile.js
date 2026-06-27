import api from "./apiProfile";

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_SOCIAL = {
  location: "Cairo, Egypt",
  website:  "https://dev.example.com",
  github:   "devuser",
  twitter:  "devuser",
  linkedin: "devuser",
};

const MOCK_STATS_EXTRA = {
  posts:     89,
  questions: 45,
  answers:   156,
  projects:  12,
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
 * GET /api/users
 */
export const fetchUserProfile = async () => {
  // ✅ FIX: apiClient interceptor بيرجع response.data مباشرة
  // فالـ response هنا = { success: true, data: user } — مش axios object
  // إحنا مش محتاجين { data } destructuring هنا
  const response = await api.get('/users');

  // ✅ handle الحالتين: لو apiClient رجع response.data أو response.data.data
  const user = response?.data ?? response;

  if (!user || typeof user !== 'object') {
    throw new Error('Invalid profile response from server');
  }

  return {
    ...user,
    location: user.location ?? MOCK_SOCIAL.location,
    website:  user.website  ?? MOCK_SOCIAL.website,
    github:   user.github   ?? MOCK_SOCIAL.github,
    twitter:  user.twitter  ?? MOCK_SOCIAL.twitter,
    linkedin: user.linkedin ?? MOCK_SOCIAL.linkedin,

    stats: {
      ...user.stats,
      posts:     user.stats?.posts     ?? MOCK_STATS_EXTRA.posts,
      questions: user.stats?.questions ?? MOCK_STATS_EXTRA.questions,
      answers:   user.stats?.answers   ?? MOCK_STATS_EXTRA.answers,
      projects:  user.stats?.projects  ?? MOCK_STATS_EXTRA.projects,
      solutions: user.stats?.solutions ?? MOCK_STATS_EXTRA.solutions,
    },

    notifications: user.notifications?.length
      ? user.notifications
      : MOCK_NOTIFICATIONS,

    joinDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          year:  'numeric',
        })
      : 'Unknown',
  };
};

/**
 * تحديث بيانات البروفايل
 * PUT /api/users/profile
 */
export const updateProfile = async (profileData) => {
  // ✅ FIX: response = { success, data: updatedUser } — نرجع .data
  const response = await api.put('/users/profile', profileData);
  return response?.data ?? response;
};

/**
 * رفع صورة البروفايل (avatar)
 * POST /api/users/avatar
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data ?? response;
};

/**
 * رفع صورة الغلاف (cover)
 * POST /api/users/cover
 */
export const uploadCover = async (file) => {
  const formData = new FormData();
  formData.append('cover', file);
  const response = await api.post('/users/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data ?? response;
};

/**
 * تعليم كل الإشعارات كمقروءة
 * PUT /api/users/notifications/read
 */
export const markNotificationsRead = async () => {
  const response = await api.put('/users/notifications/read');
  return response?.data ?? response;
};

/**
 * جلب الإشعارات
 * GET /api/users/notifications
 */
export const fetchNotifications = async () => {
  try {
    const response = await api.get('/users/notifications');
    return response?.data ?? response;
  } catch {
    return MOCK_NOTIFICATIONS;
  }
};