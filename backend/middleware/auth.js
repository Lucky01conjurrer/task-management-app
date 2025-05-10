const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockData = require('../utils/mockData');

// We'll use the global useMockData flag

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (global.useMockData) {
        // Get user from mock data
        req.user = mockData.findUserById(decoded.id);

        if (!req.user) {
          throw new Error('User not found');
        }

        // Remove password from user object
        const { password, ...userWithoutPassword } = req.user;
        req.user = userWithoutPassword;
      } else {
        try {
          // Get user from MongoDB
          req.user = await User.findById(decoded.id).select('-password');

          if (!req.user) {
            throw new Error('User not found');
          }
        } catch (mongoError) {
          // If MongoDB fails, switch to mock data
          console.error('MongoDB error, switching to mock data:', mongoError);
          global.useMockData = true;

          // Retry with mock data
          req.user = mockData.findUserById(decoded.id);

          if (!req.user) {
            throw new Error('User not found');
          }

          // Remove password from user object
          const { password, ...userWithoutPassword } = req.user;
          req.user = userWithoutPassword;
        }
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
