const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middlewares/validation');

const router = express.Router();


const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

//route for user registration.(creates new user and generates JWT token).
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'customer'
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
});

// route for user login.(generates JWT token on successful login)


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 🔥 THIS IS THE IMPORTANT FIX
  const token = jwt.sign(
  {
    userId: user._id,
    role: user.role     // ✅ REQUIRED FOR TEST
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);


   res.json({
  message: 'Login successful',
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});




//route for getting current logged in user details.
router.get('/me', require('../middlewares/auth').authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;