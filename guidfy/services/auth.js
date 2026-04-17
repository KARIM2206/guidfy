import axios from "axios";


const BASE_URL = 'http://localhost:8000/api/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};
export const login = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, userData);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getMe=async(token)=>{
  try {
    const response = await axios.get(`${BASE_URL}/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return response.data;
  } catch (error) {
    console.error('User error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'User failed');
  }
}

export const changeUserRole = async ({ email, role, token }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/change-role`,
      { email, role }, // إرسال البريد بدل userId
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Change role error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Change role failed');
  }
};

// إضافة أدمن جديد
export const addUser = async ({ email,name,password,role, token }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/add-user`,
      { email,name,password,role }, // إرسال البريد فقط
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Add admin error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Add admin failed');
  }
};

// جلب كل المستخدمين
export const getAllUsers = async ({ token, role }) => {
  try {
    console.log(`Fetching users with : ${token}`);

    const response = await axios.get(`${BASE_URL}/all-users`, {
      params: role ? { role } : {}, // 👈 الحل هنا
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get all users error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get all users failed');
  }
};
// جلب كل المستخدمين
export const getAllDashboardStats = async ({ token }) => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get all dashboard stats error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Get all dashboard stats failed');
  }
};

// حذف مستخدم
export const deleteUser = async ({ email, token }) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { email }, // الطريقة الصحيحة لإرسال body مع DELETE
    });
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Delete user failed');
  }
};