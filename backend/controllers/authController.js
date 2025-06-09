const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    
    // Log registration activity
    await user.logActivity('registration', null, { 
      registrationDate: new Date(),
      userAgent: req.headers['user-agent']
    });
    
    // Award welcome achievement
    user.awardAchievement(
      'welcome',
      'Welcome to Neural Nexus',
      'Successfully created your account and started your learning journey',
      'star'
    );
    
    // Add initial experience points
    user.addExperience(10);
    await user.save();
    
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ 
      user: { 
        name: user.name, 
        email: user.email,
        level: user.progressStats.level,
        experience: user.progressStats.experience
      }, 
      token 
    });
  } catch (error) {
    console.error(error);
    // More specific error handling for common registration issues
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Email already exists' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Please provide email and password' 
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        message: 'Invalid Credentials' 
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        message: 'Invalid Credentials' 
      });
    }

    // Track login activity and streak
    const now = new Date();
    const lastLogin = user.lastLoginDate;
    
    // Log login activity
    await user.logActivity('login', null, { 
      loginTime: now,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    });
    
    // Update login date
    user.lastLoginDate = now;
    
    // Calculate and update streak
    const currentStreak = user.calculateStreak();
    
    // Add login experience (daily bonus)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLoginToday = lastLogin && new Date(lastLogin).setHours(0, 0, 0, 0) === today.getTime();
    
    if (!lastLoginToday) {
      // First login of the day - award daily bonus
      const leveledUp = user.addExperience(5);
      
      // Check for login streak achievements
      if (currentStreak === 3 && !user.achievements.find(a => a.id === 'three_day_streak')) {
        user.awardAchievement(
          'three_day_streak',
          '3 Day Streak',
          'Maintained a 3-day login streak',
          'fire'
        );
      }
    }
    
    await user.save();
    
    // Check for new achievements
    const newAchievements = await User.checkAchievements(user._id);

    const token = user.createJWT();
    
    res.status(StatusCodes.OK).json({ 
      user: { 
        name: user.name, 
        email: user.email,
        level: user.progressStats.level,
        experience: user.progressStats.experience,
        streak: currentStreak
      }, 
      token,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

module.exports = {
  register,
  login,
};