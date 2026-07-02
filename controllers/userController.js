const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
       return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the plain text password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, isVip: user.isVip, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, isVip: user.isVip, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upgrade VIP (Mock payment)
exports.upgradeVip = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 
    
    // Simulating a successful payment
    const paymentSuccess = true; 
    
    if (paymentSuccess) {
      const user = await User.findByIdAndUpdate(userId, { isVip: true }, { new: true });
      res.json({ message: 'Upgraded to VIP successfully', isVip: user.isVip });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all users (for admin stats)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.adminCreateUser = async (req, res) => {
  try {
    const { username, password, fullName, role, isVip, isBanned } = req.body;
    const User = require('../models/User');
    const bcrypt = require('bcrypt');
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, password: hashedPassword, fullName, role: role || 'user', isVip: !!isVip, isBanned: !!isBanned });
    await user.save();
    res.status(201).json({ message: 'Success', user });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, isVip, isBanned } = req.body;
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(id, { fullName, role, isVip, isBanned }, { new: true });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.adminDeleteUser = async (req, res) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
