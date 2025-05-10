const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listRoutes = require('./routes/lists');
const taskRoutes = require('./routes/tasks');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global flag to determine if we're using mock data
global.useMockData = false;

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockData = false;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Using in-memory database for development...');

    // Set the global flag to use mock data
    global.useMockData = true;

    // For development purposes, we'll continue without MongoDB
    // In a production environment, you would want to exit the process
    // process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Trello Clone API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
