// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ActivityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login', 
      'registration', 
      'session_start', 
      'api_usage',
      'goal_created', 
      'goal_completed', 
      'goal_updated', 
      'goal_deleted', 
      'goal_viewed',
      'curriculum_viewed', 
      'curriculum_generated',
      'profile_updated',
      'dashboard_viewed',
      'settings_updated',
      'password_changed',
      'account_migrated'
    ]
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  },
  metadata: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AchievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'trophy'
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

const ProgressStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  goalsCreated: {
    type: Number,
    default: 0
  },
  goalsCompleted: {
    type: Number,
    default: 0
  },
  curriculumsViewed: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  
  // Progress Tracking Fields
  progressStats: {
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGoalsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLearningTime: {
      type: Number, // in minutes
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Activity Tracking
  activityLog: [ActivityLogSchema],
  lastLoginDate: {
    type: Date
  },
  lastActivityDate: {
    type: Date
  },
  
  // Achievements
  achievements: [AchievementSchema],
  
  // Daily Progress Stats
  dailyStats: [ProgressStatsSchema],
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    achievementNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Middleware to hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to create a JWT
UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id, name: this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME || '30d',
  });
};

// Instance method to compare entered password with stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Instance method to log activity
UserSchema.methods.logActivity = function (action, goalId = null, metadata = {}) {
  this.activityLog.push({
    action,
    goalId,
    metadata,
    timestamp: new Date()
  });
  
  this.lastActivityDate = new Date();
  
  // Keep only last 1000 activity logs to prevent excessive growth
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }
  
  return this.save();
};

// Instance method to calculate current streak
UserSchema.methods.calculateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Get unique active days from activity log
  const activeDays = new Set();
  this.activityLog.forEach(log => {
    const logDate = new Date(log.timestamp);
    logDate.setHours(0, 0, 0, 0);
    activeDays.add(logDate.getTime());
  });
  
  // Calculate consecutive days backwards from today
  while (true) {
    if (activeDays.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  this.progressStats.currentStreak = streak;
  if (streak > this.progressStats.longestStreak) {
    this.progressStats.longestStreak = streak;
  }
  
  return streak;
};

// Instance method to add experience and check for level up
UserSchema.methods.addExperience = function (points) {
  this.progressStats.experience += points;
  
  // Level up calculation (100 XP per level, increasing by 50 each level)
  const experienceNeeded = (level) => 100 + (level - 1) * 50;
  
  let newLevel = this.progressStats.level;
  while (this.progressStats.experience >= experienceNeeded(newLevel)) {
    this.progressStats.experience -= experienceNeeded(newLevel);
    newLevel++;
  }
  
  const leveledUp = newLevel > this.progressStats.level;
  this.progressStats.level = newLevel;
  
  return leveledUp;
};

// Instance method to award achievement
UserSchema.methods.awardAchievement = function (achievementId, name, description, icon = 'trophy', metadata = {}) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(a => a.id === achievementId);
  if (existingAchievement) {
    return false; // Already has this achievement
  }
  
  this.achievements.push({
    id: achievementId,
    name,
    description,
    icon,
    metadata,
    earnedAt: new Date()
  });
  
  return true; // New achievement awarded
};

// Instance method to update daily stats
UserSchema.methods.updateDailyStats = function (action, timeSpent = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let todayStats = this.dailyStats.find(stat => 
    stat.date.getTime() === today.getTime()
  );
  
  if (!todayStats) {
    todayStats = {
      date: today,
      goalsCreated: 0,
      goalsCompleted: 0,
      curriculumsViewed: 0,
      timeSpent: 0
    };
    this.dailyStats.push(todayStats);
  }
  
  switch (action) {
    case 'goal_created':
      todayStats.goalsCreated++;
      break;
    case 'goal_completed':
      todayStats.goalsCompleted++;
      this.progressStats.totalGoalsCompleted++;
      break;
    case 'curriculum_viewed':
      todayStats.curriculumsViewed++;
      break;
  }
  
  if (timeSpent > 0) {
    todayStats.timeSpent += timeSpent;
    this.progressStats.totalLearningTime += timeSpent;
  }
  
  // Keep only last 90 days of stats
  if (this.dailyStats.length > 90) {
    this.dailyStats = this.dailyStats.slice(-90);
  }
};

// Static method to check and award achievements for a user
UserSchema.statics.checkAchievements = async function (userId) {
  const user = await this.findById(userId).populate('achievements');
  const Goal = mongoose.model('Goal');
  
  // Get user's goals
  const goals = await Goal.find({ user: userId });
  const completedGoals = goals.filter(g => g.status === 'completed');
  
  const newAchievements = [];
  
  // First Goal Achievement
  if (completedGoals.length >= 1 && !user.achievements.find(a => a.id === 'first_goal')) {
    user.awardAchievement(
      'first_goal',
      'First Goal Completed',
      'Completed your first learning goal',
      'trophy'
    );
    newAchievements.push('First Goal Completed');
  }
  
  // Streak Achievements
  const currentStreak = user.calculateStreak();
  if (currentStreak >= 7 && !user.achievements.find(a => a.id === 'week_streak')) {
    user.awardAchievement(
      'week_streak',
      '7 Day Streak',
      'Maintained a 7-day learning streak',
      'fire'
    );
    newAchievements.push('7 Day Streak');
  }
  
  if (currentStreak >= 30 && !user.achievements.find(a => a.id === 'month_streak')) {
    user.awardAchievement(
      'month_streak',
      '30 Day Streak',
      'Maintained a 30-day learning streak',
      'fire'
    );
    newAchievements.push('30 Day Streak');
  }
  
  // Goal Completion Achievements
  if (completedGoals.length >= 5 && !user.achievements.find(a => a.id === 'five_goals')) {
    user.awardAchievement(
      'five_goals',
      'Goal Achiever',
      'Completed 5 learning goals',
      'star'
    );
    newAchievements.push('Goal Achiever');
  }
  
  if (completedGoals.length >= 10 && !user.achievements.find(a => a.id === 'ten_goals')) {
    user.awardAchievement(
      'ten_goals',
      'Learning Master',
      'Completed 10 learning goals',
      'crown'
    );
    newAchievements.push('Learning Master');
  }
  
  // Category Specialist Achievements
  const categoryCount = {};
  completedGoals.forEach(goal => {
    categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
  });
  
  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count >= 3 && !user.achievements.find(a => a.id === `${category}_specialist`)) {
      const categoryNames = {
        'web-development': 'Web Development',
        'data-science': 'Data Science',
        'mobile-development': 'Mobile Development',
        'devops': 'DevOps',
        'design': 'UI/UX Design',
        'business': 'Business',
        'language': 'Programming Language',
        'general': 'General'
      };
      
      user.awardAchievement(
        `${category}_specialist`,
        `${categoryNames[category]} Specialist`,
        `Completed 3 goals in ${categoryNames[category]}`,
        'medal'
      );
      newAchievements.push(`${categoryNames[category]} Specialist`);
    }
  });
  
  await user.save();
  return newAchievements;
};

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'activityLog.timestamp': -1 });
UserSchema.index({ 'dailyStats.date': -1 });
UserSchema.index({ 'progressStats.level': 1 });
UserSchema.index({ 'progressStats.currentStreak': -1 });
UserSchema.index({ 'progressStats.totalGoalsCompleted': -1 });

module.exports = mongoose.model('User', UserSchema);