// backend/routes/user.js
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getDashboardData,
  getProgress,
  getActivity,
  getAchievements,
  logActivity,
  getDailyStats,
  updatePreferences
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Profile Management Routes
// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', changePassword);

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', updatePreferences);

// Dashboard & Analytics Routes
// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', getDashboardData);

// @route   GET /api/user/progress
// @desc    Get user progress and activity data
// @access  Private
router.get('/progress', getProgress);

// @route   GET /api/user/daily-stats
// @desc    Get daily statistics
// @access  Private
router.get('/daily-stats', getDailyStats);

// Activity Management Routes
// @route   GET /api/user/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', getActivity);

// @route   POST /api/user/activity
// @desc    Log user activity
// @access  Private
router.post('/activity', logActivity);

// Achievement Routes
// @route   GET /api/user/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', getAchievements);

module.exports = router;