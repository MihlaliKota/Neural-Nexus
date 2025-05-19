// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // Log the Authorization header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authentication Error: Invalid or missing Authorization header.');
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authentication invalid' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token); // Log the extracted token

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, name: payload.name };
    console.log('Decoded Payload:', payload); // Log the decoded payload
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authentication invalid' });
  }
};

module.exports = authMiddleware;