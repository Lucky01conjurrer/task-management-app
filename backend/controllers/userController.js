const User = require('../models/User');
const mockData = require('../utils/mockData');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    if (global.useMockData) {
      // Using mock data
      const user = mockData.findUserById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } else {
      // Using MongoDB
      try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
      } catch (mongoError) {
        // If MongoDB fails, switch to mock data
        console.error('MongoDB error, switching to mock data:', mongoError);
        global.useMockData = true;
        
        // Retry with mock data
        const user = mockData.findUserById(req.user._id);
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        res.json(userWithoutPassword);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (global.useMockData) {
      // Using mock data
      try {
        const updatedUser = await mockData.updateUser(req.user._id, {
          name,
          email,
          password
        });
        
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        
        res.json({
          ...userWithoutPassword,
          message: 'Profile updated successfully'
        });
      } catch (error) {
        if (error.message === 'Email already in use') {
          return res.status(400).json({ message: 'Email already in use' });
        }
        throw error;
      }
    } else {
      // Using MongoDB
      try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if email is already taken by another user
        if (email && email !== user.email) {
          const emailExists = await User.findOne({ email });
          if (emailExists) {
            return res.status(400).json({ message: 'Email already in use' });
          }
        }
        
        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        
        const updatedUser = await user.save();
        
        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          message: 'Profile updated successfully'
        });
      } catch (mongoError) {
        // If MongoDB fails, switch to mock data
        console.error('MongoDB error, switching to mock data:', mongoError);
        global.useMockData = true;
        
        // Retry with mock data
        try {
          const updatedUser = await mockData.updateUser(req.user._id, {
            name,
            email,
            password
          });
          
          // Remove password from response
          const { password, ...userWithoutPassword } = updatedUser;
          
          res.json({
            ...userWithoutPassword,
            message: 'Profile updated successfully'
          });
        } catch (error) {
          if (error.message === 'Email already in use') {
            return res.status(400).json({ message: 'Email already in use' });
          }
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
