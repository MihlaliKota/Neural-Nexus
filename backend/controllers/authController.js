const User = require('../models/User');
const { StatusCodes } = require('http-status-codes'); // Good practice for consistent status codes

const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ user: { name: user.name, email: user.email }, token });
  } catch (error) {
    console.error(error);
    // More specific error handling for common registration issues
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Email already exists' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password for comparison
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid Credentials' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid Credentials' });
    }

    const token = user.createJWT();
    // Don't send back the password hash
    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = {
  register,
  login,
};