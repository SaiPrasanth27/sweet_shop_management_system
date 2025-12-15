const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/sweetshop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'customer' }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Sweet Schema
const sweetSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  quantity: { type: Number, default: 0 }
});

const Sweet = mongoose.model('Sweet', sweetSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    sweet: { type: mongoose.Schema.Types.ObjectId, ref: 'Sweet' },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: { type: String, default: 'pending' },
  notes: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role: role || 'customer' });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, 'secret123', { expiresIn: '7d' });
    res.json({ message: 'Success', user: { id: user._id, username, email, role: user.role }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, 'secret123', { expiresIn: '7d' });
    res.json({ message: 'Success', user: { id: user._id, username: user.username, email, role: user.role }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, 'secret123');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Sweet Routes
app.get('/api/Sweet', async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json({ sweets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/Sweet', auth, async (req, res) => {
  try {
    console.log('Creating sweet:', req.body);
    const sweet = new Sweet(req.body);
    await sweet.save();
    console.log('Sweet created:', sweet);
    res.json({ message: 'Sweet created successfully', sweet });
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/Sweet/:id', auth, async (req, res) => {
  try {
    const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ sweet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/Sweet/:id', async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    res.json({ sweet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/Sweet/:id/purchase', async (req, res) => {
  try {
    const { quantity = 1, notes = '' } = req.body;
    const sweet = await Sweet.findById(req.params.id);
    
    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock' });
    }
    
    sweet.quantity -= quantity;
    await sweet.save();
    
    res.json({ message: 'Purchase successful', sweet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/Sweet/:id/restock', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const sweet = await Sweet.findById(req.params.id);
    sweet.quantity += parseInt(quantity);
    await sweet.save();
    res.json({ message: 'Sweet restocked successfully', sweet, newQuantity: sweet.quantity });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/Sweet/:id', auth, async (req, res) => {
  try {
    await Sweet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Orders route
app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(8000, () => console.log('Server running on port 8000'));