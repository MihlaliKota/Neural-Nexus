// backend/middleware/activityMiddleware.js
const User = require('../models/User');

// Middleware to automatically track user activity
const trackActivity = (action, options = {}) => {
  return async (req, res, next) => {
    try {
      // Store the original res.json method
      const originalJson = res.json.bind(res);
      
      // Override res.json to track activity after successful response
      res.json = function(data) {
        // Only track activity for successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Track activity asynchronously without blocking response
          setImmediate(async () => {
            try {
              if (req.user && req.user.id) {
                const user = await User.findById(req.user.id);
                if (user) {
                  let metadata = { ...options.metadata };
                  
                  // Add request-specific metadata
                  if (options.includeParams && req.params) {
                    metadata.params = req.params;
                  }
                  
                  if (options.includeBody && req.body) {
                    metadata.requestBody = req.body;
                  }
                  
                  if (options.includeQuery && req.query) {
                    metadata.query = req.query;
                  }
                  
                  // Add response data if specified
                  if (options.includeResponse && data) {
                    metadata.response = {
                      success: data.success,
                      dataType: typeof data.data
                    };
                  }
                  
                  // Extract goalId from various sources
                  let goalId = null;
                  if (req.params.id) goalId = req.params.id;
                  if (req.params.goalId) goalId = req.params.goalId;
                  if (req.body.goalId) goalId = req.body.goalId;
                  if (data && data.goal && data.goal._id) goalId = data.goal._id;
                  
                  await user.logActivity(action, goalId, metadata);
                  
                  // Update daily stats if specified
                  if (options.updateStats) {
                    user.updateDailyStats(action, options.timeSpent || 0);
                  }
                  
                  // Award experience if specified
                  if (options.experience > 0) {
                    user.addExperience(options.experience);
                  }
                  
                  await user.save();
                }
              }
            } catch (error) {
              console.error('Error tracking activity:', error);
              // Don't throw error - activity tracking should not break the main flow
            }
          });
        }
        
        // Call the original res.json method
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Error in activity tracking middleware:', error);
      next(); // Continue even if activity tracking fails
    }
  };
};

// Predefined activity tracking configurations
const ActivityTypes = {
  GOAL_VIEWED: trackActivity('goal_viewed', {
    includeParams: true,
    experience: 2,
    metadata: { action: 'viewed_goal_details' }
  }),
  
  CURRICULUM_VIEWED: trackActivity('curriculum_viewed', {
    includeParams: true,
    updateStats: true,
    timeSpent: 5,
    experience: 5,
    metadata: { action: 'viewed_curriculum' }
  }),
  
  PROFILE_UPDATED: trackActivity('profile_updated', {
    includeBody: false, // Don't log sensitive data
    experience: 5,
    metadata: { action: 'updated_profile' }
  }),
  
  DASHBOARD_VIEWED: trackActivity('dashboard_viewed', {
    experience: 1,
    metadata: { action: 'viewed_dashboard' }
  }),
  
  SETTINGS_UPDATED: trackActivity('settings_updated', {
    experience: 2,
    metadata: { action: 'updated_settings' }
  })
};

// Middleware to automatically log login activity (used in auth middleware)
const logLoginActivity = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        const lastLogin = user.lastLoginDate;
        const now = new Date();
        
        // Check if this is a new session (more than 30 minutes since last activity)
        const timeSinceLastActivity = user.lastActivityDate 
          ? (now - new Date(user.lastActivityDate)) / (1000 * 60)
          : Infinity;
          
        if (timeSinceLastActivity > 30) {
          await user.logActivity('session_start', null, {
            sessionStart: now,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
          });
          
          // Update last login if it's a new day
          if (!lastLogin || new Date(lastLogin).toDateString() !== now.toDateString()) {
            user.lastLoginDate = now;
            user.addExperience(5); // Daily login bonus
          }
          
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Error logging login activity:', error);
  }
  
  next();
};

// Middleware to track API endpoint usage
const trackEndpointUsage = (endpointName) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.id) {
        const user = await User.findById(req.user.id);
        if (user) {
          await user.logActivity('api_usage', null, {
            endpoint: endpointName,
            method: req.method,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
          });
          await user.save();
        }
      }
    } catch (error) {
      console.error('Error tracking endpoint usage:', error);
    }
    
    next();
  };
};

module.exports = {
  trackActivity,
  ActivityTypes,
  logLoginActivity,
  trackEndpointUsage
};