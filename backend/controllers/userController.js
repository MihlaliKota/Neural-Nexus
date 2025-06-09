const User = require('../models/User');
const Goal = require('../models/Goal');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Get user statistics
    const goalStats = await Goal.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      paused: 0
    };

    goalStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch profile');
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { name, email } = req.body;

    // Find user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    const updatedUser = await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      res.status(StatusCodes.CONFLICT);
      throw new Error('Email already exists');
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to update profile');
  }
});

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Please provide current and new password');
    }

    if (newPassword.length < 6) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('New password must be at least 6 characters');
    }

    // Find user and include password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Check if current password is correct
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordCorrect) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to change password');
  }
});

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent goals
    const recentGoals = await Goal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('description status priority createdAt targetDate');

    // Get goal statistics by category
    const categoryStats = await Goal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get goals by status
    const statusStats = await Goal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get upcoming deadlines
    const upcomingDeadlines = await Goal.find({
      user: userId,
      targetDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' }
    }).sort({ targetDate: 1 }).limit(5);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        recentGoals,
        categoryStats,
        statusStats,
        upcomingDeadlines
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch dashboard data');
  }
});

// @desc    Get user progress and activity data
// @route   GET /api/user/progress
// @access  Private
const getProgress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Calculate current streak
    const currentStreak = user.calculateStreak();
    
    // Get weekly progress (goals completed this week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const goalsCompletedThisWeek = await Goal.countDocuments({
      user: req.user.id,
      status: 'completed',
      updatedAt: { $gte: weekStart, $lt: weekEnd }
    });
    
    // Get total goals for the week (to calculate percentage)
    const totalGoalsThisWeek = await Goal.countDocuments({
      user: req.user.id,
      createdAt: { $gte: weekStart, $lt: weekEnd }
    });
    
    const weeklyProgress = totalGoalsThisWeek > 0 
      ? Math.round((goalsCompletedThisWeek / totalGoalsThisWeek) * 100)
      : 0;
    
    // Get monthly goals
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const goalsCompletedThisMonth = await Goal.countDocuments({
      user: req.user.id,
      status: 'completed',
      updatedAt: { $gte: monthStart, $lt: monthEnd }
    });
    
    const totalGoalsThisMonth = await Goal.countDocuments({
      user: req.user.id,
      createdAt: { $gte: monthStart, $lt: monthEnd }
    });
    
    // Calculate level progress (experience to next level)
    const currentLevel = user.progressStats.level;
    const currentExperience = user.progressStats.experience;
    const experienceForNextLevel = 100 + (currentLevel - 1) * 50;
    const levelProgress = Math.round((currentExperience / experienceForNextLevel) * 100);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        streakDays: currentStreak,
        longestStreak: user.progressStats.longestStreak,
        weeklyProgress,
        monthlyGoals: {
          completed: goalsCompletedThisMonth,
          total: totalGoalsThisMonth
        },
        levelProgress,
        level: currentLevel,
        experience: currentExperience,
        experienceToNextLevel: experienceForNextLevel - currentExperience,
        totalGoalsCompleted: user.progressStats.totalGoalsCompleted,
        totalLearningTime: user.progressStats.totalLearningTime
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch progress');
  }
});

// @desc    Get user activity log
// @route   GET /api/user/activity
// @access  Private
const getActivity = asyncHandler(async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id)
      .populate('activityLog.goalId', 'description category status')
      .select('activityLog lastLoginDate lastActivityDate');
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Get paginated activity log
    const activities = user.activityLog
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + parseInt(limit));

    // Calculate activity stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activitiesToday = user.activityLog.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    }).length;
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const activitiesThisWeek = user.activityLog.filter(log => 
      new Date(log.timestamp) >= lastWeek
    ).length;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        activities,
        stats: {
          activitiesToday,
          activitiesThisWeek,
          totalActivities: user.activityLog.length
        },
        lastLoginDate: user.lastLoginDate,
        lastActivityDate: user.lastActivityDate,
        hasMore: user.activityLog.length > offset + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch activity');
  }
});

// @desc    Get user achievements
// @route   GET /api/user/achievements
// @access  Private
const getAchievements = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('achievements');
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Sort achievements by earned date (newest first)
    const achievements = user.achievements.sort((a, b) => 
      new Date(b.earnedAt) - new Date(a.earnedAt)
    );

    // Check for new achievements
    const newAchievements = await User.checkAchievements(req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        achievements,
        newAchievements,
        totalAchievements: achievements.length
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch achievements');
  }
});

// @desc    Log user activity
// @route   POST /api/user/activity
// @access  Private
const logActivity = asyncHandler(async (req, res) => {
  try {
    const { action, goalId, timeSpent = 0, metadata = {} } = req.body;
    
    if (!action) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Action is required');
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Log the activity
    await user.logActivity(action, goalId, metadata);
    
    // Update daily stats
    user.updateDailyStats(action, timeSpent);
    
    // Add experience points based on activity
    let experienceGained = 0;
    switch (action) {
      case 'goal_created':
        experienceGained = 10;
        break;
      case 'goal_completed':
        experienceGained = 50;
        break;
      case 'curriculum_viewed':
        experienceGained = 5;
        break;
      case 'login':
        experienceGained = 2;
        break;
    }
    
    const leveledUp = user.addExperience(experienceGained);
    await user.save();
    
    // Check for new achievements
    const newAchievements = await User.checkAchievements(req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        experienceGained,
        leveledUp,
        newLevel: user.progressStats.level,
        newAchievements
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to log activity');
  }
});

// @desc    Get daily statistics
// @route   GET /api/user/daily-stats
// @access  Private
const getDailyStats = asyncHandler(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const user = await User.findById(req.user.id).select('dailyStats');
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Get stats for the specified number of days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const stats = user.dailyStats
      .filter(stat => stat.date >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate totals
    const totals = stats.reduce((acc, stat) => ({
      goalsCreated: acc.goalsCreated + stat.goalsCreated,
      goalsCompleted: acc.goalsCompleted + stat.goalsCompleted,
      curriculumsViewed: acc.curriculumsViewed + stat.curriculumsViewed,
      timeSpent: acc.timeSpent + stat.timeSpent
    }), {
      goalsCreated: 0,
      goalsCompleted: 0,
      curriculumsViewed: 0,
      timeSpent: 0
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        dailyStats: stats,
        totals,
        period: {
          days: parseInt(days),
          from: cutoffDate,
          to: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch daily stats');
  }
});

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  try {
    const { emailNotifications, weeklyReports, achievementNotifications } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('User not found');
    }

    // Update preferences
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }
    if (weeklyReports !== undefined) {
      user.preferences.weeklyReports = weeklyReports;
    }
    if (achievementNotifications !== undefined) {
      user.preferences.achievementNotifications = achievementNotifications;
    }

    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to update preferences');
  }
});

module.exports = {
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
};