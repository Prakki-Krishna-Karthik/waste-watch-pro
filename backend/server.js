const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/wastewatch')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ==================== MODELS ====================

// User Model
const UserSchema = new mongoose.Schema({
  username: String, email: String, password: String,
  role: { type: String, default: 'nurse' },
  fullName: String, department: String, isActive: { type: Boolean, default: true }
});
const User = mongoose.model('User', UserSchema);

// Medicine Model
const MedicineSchema = new mongoose.Schema({
  name: String, category: String, manufacturer: String,
  genericName: String, reorderLevel: { type: Number, default: 0 }
});
const Medicine = mongoose.model('Medicine', MedicineSchema);

// Batch Model
const BatchSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  batchNumber: String, quantity: Number, expiryDate: Date,
  price: Number, supplier: String, isUsed: { type: Boolean, default: false }
});
const Batch = mongoose.model('Batch', BatchSchema);

// ==================== MIDDLEWARE ====================

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, 'secret');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, fullName, role });
    res.json({ success: true, data: { id: user._id, username, email, fullName } });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '7d' });
    res.json({ success: true, data: { user, token } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/auth/profile', auth, (req, res) => {
  res.json({ success: true, data: req.user });
});

// ==================== MEDICINE ROUTES ====================

app.get('/api/medicines', auth, async (req, res) => {
  const medicines = await Medicine.find();
  res.json({ success: true, data: medicines });
});

app.post('/api/medicines', auth, async (req, res) => {
  const medicine = await Medicine.create(req.body);
  res.json({ success: true, data: medicine });
});

app.put('/api/medicines/:id', auth, async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: medicine });
});

app.delete('/api/medicines/:id', auth, async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

// ==================== BATCH ROUTES ====================

app.get('/api/batches', auth, async (req, res) => {
  const batches = await Batch.find().populate('medicineId', 'name');
  res.json({ success: true, data: batches });
});

app.post('/api/batches', auth, async (req, res) => {
  const batch = await Batch.create(req.body);
  res.json({ success: true, data: batch });
});

app.get('/api/batches/priority-list', auth, async (req, res) => {
  const batches = await Batch.find({ isUsed: false, quantity: { $gt: 0 } })
    .populate('medicineId', 'name').sort({ expiryDate: 1 });
  res.json({ success: true, data: batches });
});

app.get('/api/batches/heatmap', auth, async (req, res) => {
  const today = new Date();
  const batches = await Batch.find({ isUsed: false, quantity: { $gt: 0 } }).populate('medicineId', 'name');
  const heatMap = { critical: [], high: [], medium: [], low: [], expired: [] };
  batches.forEach(b => {
    const days = Math.ceil((new Date(b.expiryDate) - today) / (1000*60*60*24));
    if (days <= 0) heatMap.expired.push(b);
    else if (days <= 30) heatMap.critical.push(b);
    else if (days <= 60) heatMap.high.push(b);
    else if (days <= 90) heatMap.medium.push(b);
    else heatMap.low.push(b);
  });
  res.json({ success: true, data: heatMap });
});

// ==================== START SERVER ====================

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
