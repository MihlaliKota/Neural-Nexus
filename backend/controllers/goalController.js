// backend/controllers/goalController.js
const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');
const { StatusCodes } = require('http-status-codes');

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

  try {
    const goal = await Goal.create({
      user: req.user.id,
      description: req.body.description,
    });
    console.log('Goal saved successfully:', goal);
    res.status(StatusCodes.CREATED).json({ message: 'Goal submitted successfully', goal });
  } catch (error) {
    console.error('Error saving goal:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to save goal');
  }
  console.log('--- End of submitGoal ---');
});

module.exports = {
  submitGoal,
};