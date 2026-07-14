const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (enteredPassword, storedPassword) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });
};

// Calculate days left
const calculateDaysLeft = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

// Get risk level
const getRiskLevel = (daysLeft) => {
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 30) return 'critical';
  if (daysLeft <= 60) return 'high';
  if (daysLeft <= 90) return 'medium';
  return 'low';
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

// Generate random ID
const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

// Validate email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  calculateDaysLeft,
  getRiskLevel,
  formatCurrency,
  generateId,
  isValidEmail
};
