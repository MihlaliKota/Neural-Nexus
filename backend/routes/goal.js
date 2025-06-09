const express = require('express');
const router = express.Router();
const { 
  submitGoal, 
  getUserGoals, 
  getGoalCurriculum,
  updateGoal, 
  deleteGoal 
} = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/goals
// @desc    Submit a new learning goal
// @access  Private
router.post('/', submitGoal);

// @route   GET /api/goals
// @desc    Get all goals for the authenticated user
// @access  Private
router.get('/', getUserGoals);

// @route   GET /api/goals/:id/curriculum
// @desc    Get curriculum for a specific goal
// @access  Private
router.get('/:id/curriculum', getGoalCurriculum);

// @route   PUT /api/goals/:id
// @desc    Update a specific goal
// @access  Private
router.put('/:id', updateGoal);

// @route   DELETE /api/goals/:id
// @desc    Delete a specific goal
// @access  Private
router.delete('/:id', deleteGoal);

module.exports = router;