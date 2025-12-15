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
router.post('/register', async (req, res) => {
  try {
    console.log('Register request:', req.body);
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
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
      message: 'Registration successful',
      user: { id: user._id, username, email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    res.status(500).json({ error: 'Registration failed' });
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
    userId: user._id.toString(), // 🔥 REQUIRED
    role: user.role              // 🔥 REQUIRED
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);


   res.status(200).json({
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