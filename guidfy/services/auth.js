import apiClient from "@/lib/apiClient";

// ═══════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════

export const register = (userData) => apiClient.post("/auth/register", userData);

export const login = (userData) => apiClient.post("/auth/login", userData);

export const getMe = () => apiClient.get("/auth/me");

export const logout = () => apiClient.post("/auth/logout");

// ═══════════════════════════════════════════════════
//  ADMIN USERS
// ═══════════════════════════════════════════════════

export const changeUserRole = ({ email, role }) =>
  apiClient.post("/auth/change-role", { email, role });

export const addUser = ({ email, name, password, role }) =>
  apiClient.post("/auth/add-user", { email, name, password, role });

export const getAllUsers = ({ role } = {}) =>
  apiClient.get("/auth/all-users", { params: role ? { role } : {} });

export const getAllDashboardStats = () =>
  apiClient.get("/auth/dashboard-stats");

export const deleteUser = ({ email }) =>
  apiClient.delete("/auth/delete-user", { data: { email } });