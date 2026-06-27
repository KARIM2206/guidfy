// routes/authRoute.js
'use strict';

const router    = require('express').Router();
const {
  register,
  login,
  logout,
  getCurrentUser,
  getAllUsers,
  changeUserRole,
  deleteUser,
  addUser,
  getAllDashboardStats,
} = require('../controllers/auth.controller');

const { protect }  = require('../middleware/authMiddleware');
const checkUser    = require('../middleware/checkUser');
const allowedTo    = require('../utils/allowedTo');

// Public
router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);   // ← new: clears HttpOnly cookie

// Protected
router.get('/me',             protect, getCurrentUser);
router.get('/dashboard-stats', protect, checkUser, getAllDashboardStats);
router.get('/all-users',       protect, checkUser, getAllUsers);

// SUPER_ADMIN only
router.post('/change-role',  protect, checkUser, allowedTo('SUPER_ADMIN'), changeUserRole);
router.post('/add-user',     protect, checkUser, allowedTo('SUPER_ADMIN'), addUser);
router.delete('/delete-user', protect, checkUser, allowedTo('SUPER_ADMIN'), deleteUser);

module.exports = router;