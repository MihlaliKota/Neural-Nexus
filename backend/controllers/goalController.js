const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MAKE_COM_WEBHOOK_URL:', process.env.MAKE_COM_WEBHOOK_URL);
console.log('MAKE_COM_WEBHOOK_URL (length):', process.env.MAKE_COM_WEBHOOK_URL ? process.env.MAKE_COM_WEBHOOK_URL.length : 'undefined');
console.log('🔍 END DEBUG');
console.log('---');

const MAKE_COM_WEBHOOK_URL = process.env.MAKE_COM_WEBHOOK_URL;

// @desc    Submit a new learning goal
// @route   POST /api/goals
// @access  Private (requires authentication)
const submitGoal = asyncHandler(async (req, res) => {
  console.log('--- Start of submitGoal ---');
  console.log('Received request body:', req.body);
  console.log('Authenticated user:', req.user);

  if (!req.body || !req.body.description) {
    console.log('Validation Error: Goal description is missing.');
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please add a goal description');
  }

  if (!req.user) {
    console.log('Authentication Error: User not authenticated.');
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('User not authenticated');
  }

  let goal;
  let curriculum = null;
  
  try {
    goal = await Goal.create({
      user: req.user.id,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      targetDate: req.body.targetDate || null,
      category: req.body.category || 'general',
      status: req.body.status || 'pending',
      progress: req.body.progress || 0,
      tags: req.body.tags || [],
      notes: req.body.notes || ''
    });
    console.log('Goal saved successfully:', goal);

    // Track goal creation activity
    const user = await User.findById(req.user.id);
    if (user) {
      await user.logActivity('goal_created', goal._id, {
        goalDescription: req.body.description,
        category: req.body.category,
        priority: req.body.priority
      });
      
      // Update daily stats
      user.updateDailyStats('goal_created');
      
      // Award experience points for creating a goal
      const leveledUp = user.addExperience(10);
      await user.save();
      
      // Check for achievements
      const newAchievements = await User.checkAchievements(req.user.id);
    }

    // --- Send data to Make.com ---
    if (MAKE_COM_WEBHOOK_URL) {
      const dataToSend = {
        userId: req.user.id,
        userName: req.user.name,
        goalId: goal._id.toString(),
        goalDescription: req.body.description,
        priority: req.body.priority || 'medium',
        category: req.body.category || 'general',
        targetDate: req.body.targetDate,
        status: goal.status,
        tags: req.body.tags || [],
        notes: req.body.notes || '',
        createdAt: goal.createdAt,
        jwtToken: req.headers.authorization,
        userContext: {
          previousGoalsCount: await Goal.countDocuments({ user: req.user.id }),
          accountCreated: req.user.createdAt || null
        }
      };

      console.log('🚀 Sending data to Make.com...');

      try {
        const makeComResponse = await axios.post(MAKE_COM_WEBHOOK_URL, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NeuralNexus/1.0'
          },
          timeout: 30000
        });
        
        console.log('✅ Make.com Response Status:', makeComResponse.status);
        console.log('✅ Make.com Response Data:', makeComResponse.data);
        
        // 🎯 EXTRACT AND SAVE CURRICULUM
        if (makeComResponse.data) {
          if (makeComResponse.data.curriculum) {
            curriculum = makeComResponse.data.curriculum;
            console.log('📚 Curriculum received from Make.com (curriculum key)');
          } else if (makeComResponse.data.generatedContent) {
            curriculum = makeComResponse.data.generatedContent;
            console.log('📚 Curriculum received from Make.com (generatedContent key)');
          } else if (makeComResponse.data.content) {
            curriculum = makeComResponse.data.content;
            console.log('📚 Curriculum received from Make.com (content key)');
          } else if (typeof makeComResponse.data === 'string') {
            curriculum = makeComResponse.data;
            console.log('📚 Curriculum received from Make.com (string response)');
          }
          
          // 🎯 SAVE CURRICULUM TO DATABASE
          if (curriculum) {
            goal.curriculum = curriculum;
            goal.curriculumGeneratedAt = new Date();
            goal.hasCurriculum = true;
            
            if (makeComResponse.data.executionId) {
              goal.makeComExecutionId = makeComResponse.data.executionId;
            }
            
            await goal.save();
            console.log('✅ Curriculum saved to database');
            
            // Log curriculum generation activity
            if (user) {
              await user.logActivity('curriculum_generated', goal._id, {
                curriculumLength: curriculum.length,
                makeComExecutionId: makeComResponse.data.executionId
              });
            }
          }
        }
        
        console.log('✅ Data successfully sent to Make.com');
        
      } catch (error) {
        console.error('❌ Error sending data to Make.com:', error);
        console.log('⚠️  Goal saved successfully despite Make.com error');
      }
    } else {
      console.warn('⚠️  MAKE_COM_WEBHOOK_URL not set in .env. Skipping Make.com integration.');
    }

    // 🎯 RETURN RESPONSE WITH CURRICULUM
    res.status(StatusCodes.CREATED).json({ 
      message: 'Goal submitted successfully', 
      goal: {
        ...goal.toObject(),
        hasCurriculum: goal.hasCurriculum
      },
      curriculum: curriculum,
      makeComIntegration: MAKE_COM_WEBHOOK_URL ? 'enabled' : 'disabled',
      hasAICurriculum: curriculum ? true : false
    });
    
  } catch (error) {
    console.error('Error saving goal:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to save goal');
  }
  console.log('--- End of submitGoal ---');
});

// @desc    Get all goals for the authenticated user
// @route   GET /api/goals
// @access  Private
const getUserGoals = asyncHandler(async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('description priority targetDate category createdAt status progress tags notes hasCurriculum curriculumGeneratedAt');

    res.status(StatusCodes.OK).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch goals');
  }
});

// 🎯 NEW: Get curriculum for a specific goal
// @desc    Get curriculum for a specific goal
// @route   GET /api/goals/:id/curriculum
// @access  Private
const getGoalCurriculum = asyncHandler(async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).select('curriculum hasCurriculum curriculumGeneratedAt description user');

    if (!goal) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('Goal not found');
    }

    // Check if the goal belongs to the authenticated user
    if (goal.user.toString() !== req.user.id) {
      res.status(StatusCodes.FORBIDDEN);
      throw new Error('Not authorized to view this curriculum');
    }

    if (!goal.hasCurriculum || !goal.curriculum) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('No curriculum found for this goal');
    }

    // Track curriculum viewing activity
    const user = await User.findById(req.user.id);
    if (user) {
      await user.logActivity('curriculum_viewed', goal._id, {
        goalDescription: goal.description,
        viewedAt: new Date()
      });
      
      // Update daily stats
      user.updateDailyStats('curriculum_viewed', 5); // 5 minutes estimated reading time
      
      // Award experience for viewing curriculum
      const leveledUp = user.addExperience(5);
      await user.save();
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        goalId: goal._id,
        goalDescription: goal.description,
        curriculum: goal.curriculum,
        generatedAt: goal.curriculumGeneratedAt,
        hasCurriculum: goal.hasCurriculum
      }
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to fetch curriculum');
  }
});

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('Goal not found');
    }

    // Check if the goal belongs to the authenticated user
    if (goal.user.toString() !== req.user.id) {
      res.status(StatusCodes.FORBIDDEN);
      throw new Error('Not authorized to update this goal');
    }

    const oldStatus = goal.status;
    const newStatus = req.body.status;

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Track goal update activity
    const user = await User.findById(req.user.id);
    if (user) {
      await user.logActivity('goal_updated', goal._id, {
        updatedFields: Object.keys(req.body),
        oldStatus,
        newStatus
      });
      
      // Special handling for completion
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        await user.logActivity('goal_completed', goal._id, {
          goalDescription: goal.description,
          completedAt: new Date(),
          category: goal.category
        });
        
        // Update daily stats
        user.updateDailyStats('goal_completed');
        
        // Award experience for completing a goal
        const leveledUp = user.addExperience(50);
        await user.save();
        
        // Check for completion achievements
        const newAchievements = await User.checkAchievements(req.user.id);
      } else {
        await user.save();
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to update goal');
  }
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error('Goal not found');
    }

    // Check if the goal belongs to the authenticated user
    if (goal.user.toString() !== req.user.id) {
      res.status(StatusCodes.FORBIDDEN);
      throw new Error('Not authorized to delete this goal');
    }

    // Track goal deletion activity
    const user = await User.findById(req.user.id);
    if (user) {
      await user.logActivity('goal_deleted', goal._id, {
        goalDescription: goal.description,
        deletedAt: new Date(),
        category: goal.category,
        status: goal.status
      });
      await user.save();
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to delete goal');
  }
});

module.exports = {
  submitGoal,
  getUserGoals,
  getGoalCurriculum, 
  updateGoal,
  deleteGoal,
};