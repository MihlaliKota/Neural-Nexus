// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goal'); // Import goal routes
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // or '*'
  credentials: true,
}));
app.use(express.json());

// Connect to Database
connectDB();

// Base API route
app.get('/api', (req, res) => {
  res.json({ message: 'MERN API is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes); // Use goal routes

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});