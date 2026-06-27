// ✅ استبدال كامل لـ apiProfile.js
// بدل ما نعمل axios instance جديدة بتقرأ من localStorage،
// نستخدم apiClient اللي عنده withCredentials: true وبيبعت الـ cookie تلقائي

import apiClient from '@/lib/apiClient';

export default apiClient;