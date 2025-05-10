const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mockData = require('../utils/mockData');

// We'll use the global useMockData flag

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (global.useMockData) {
      try {
        // Using mock data
        const user = await mockData.createUser({ name, email, password });

        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        });
      } catch (error) {
        if (error.message === 'User already exists') {
          return res.status(400).json({ message: 'User already exists' });
        }
        throw error;
      }
    } else {
      // Using MongoDB
      try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
          name,
          email,
          password
        });

        if (user) {
          res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
          });
        } else {
          res.status(400).json({ message: 'Invalid user data' });
        }
      } catch (mongoError) {
        // If MongoDB fails, switch to mock data
        console.error('MongoDB error, switching to mock data:', mongoError);
        global.useMockData = true;

        // Retry with mock data
        const user = await mockData.createUser({ name, email, password });

        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (global.useMockData) {
      // Using mock data
      const user = mockData.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if password matches
      const isMatch = await mockData.comparePassword(user, password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      // Using MongoDB
      try {
        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        });
      } catch (mongoError) {
        // If MongoDB fails, switch to mock data
        console.error('MongoDB error, switching to mock data:', mongoError);
        global.useMockData = true;

        // Retry with mock data
        const user = mockData.findUserByEmail(email);

        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if password matches
        const isMatch = await mockData.comparePassword(user, password);

        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user (just for API completeness, actual logout happens on client)
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout
};
