// backend/routes/goal.js
const express = require('express');
const router = express.Router();
const { submitGoal } = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitGoal);

module.exports = router;