const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==================== MODELS ====================

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'nurse', 'doctor', 'manager', 'pharmacist'], default: 'nurse' },
  fullName: { type: String, required: true },
  department: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: String,
  manufacturer: String,
  genericName: String,
  strength: String,
  dosageForm: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops'] },
  reorderLevel: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  maxStockLevel: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Medicine = mongoose.model('Medicine', MedicineSchema);

const BatchSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  manufacturingDate: Date,
  price: { type: Number, required: true },
  purchasePrice: Number,
  supplier: String,
  location: String,
  daysLeft: Number,
  riskLevel: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
  isUsed: { type: Boolean, default: false },
  isExpired: { type: Boolean, default: false }
}, { timestamps: true });
const Batch = mongoose.model('Batch', BatchSchema);

const PayrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  department: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  houseRentAllowance: { type: Number, default: 0 },
  dearnessAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  travelAllowance: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  providentFund: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  incomeTax: { type: Number, default: 0 },
  healthInsurance: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'pending', 'paid', 'overdue'], default: 'pending' },
  paymentDate: Date,
  paymentMethod: { type: String, enum: ['bank-transfer', 'cash', 'cheque', 'upi'] },
  transactionId: String
}, { timestamps: true });
const Payroll = mongoose.model('Payroll', PayrollSchema);

const ResearchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  content: { type: String, required: true },
  authors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['primary', 'co-author', 'corresponding'] },
    affiliation: String
  }],
  keywords: [String],
  category: { type: String, enum: ['clinical', 'pharmaceutical', 'public-health', 'medical-education', 'case-study', 'review'] },
  status: { type: String, enum: ['draft', 'submitted', 'under-review', 'revision-required', 'published', 'rejected'], default: 'draft' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  citations: [{
    researchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
    citedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
const Research = mongoose.model('Research', ResearchSchema);

const TaskSchema = new mongoose.Schema({
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['medication-administration', 'patient-care', 'reporting', 'vitals', 'emergency', 'administrative'] },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  shift: { type: String, enum: ['morning', 'evening', 'night'], required: true },
  date: { type: Date, required: true },
  time: String,
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  notes: String,
  completedAt: Date,
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  patientName: String,
  roomNumber: String,
  bedNumber: String
}, { timestamps: true });
const Task = mongoose.model('Task', TaskSchema);

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  action: { type: String, required: true },
  module: { type: String, enum: ['auth', 'inventory', 'payroll', 'research', 'task', 'analytics', 'admin'] },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  status: { type: String, enum: ['success', 'failure'], default: 'success' }
}, { timestamps: true });
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// ==================== MIDDLEWARE ====================

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role, department } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, fullName, role, department });
    await ActivityLog.create({ userId: user._id, username, action: 'Registered', module: 'auth', status: 'success' });
    res.json({ success: true, data: { id: user._id, username, email, fullName, role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    await ActivityLog.create({ userId: user._id, username: user.username, action: 'Logged in', module: 'auth', status: 'success' });
    res.json({ success: true, data: { user, token } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/profile', auth, async (req, res) => {
  res.json({ success: true, data: req.user });
});

app.put('/api/auth/profile', auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
  res.json({ success: true, data: user });
});

// ==================== MEDICINE ROUTES ====================

app.get('/api/medicines', auth, async (req, res) => {
  const medicines = await Medicine.find();
  res.json({ success: true, data: medicines });
});

app.post('/api/medicines', auth, authorize('admin', 'pharmacist'), async (req, res) => {
  const medicine = await Medicine.create(req.body);
  await ActivityLog.create({ userId: req.user._id, username: req.user.username, action: 'Created medicine', module: 'inventory', details: medicine });
  res.json({ success: true, data: medicine });
});

app.put('/api/medicines/:id', auth, authorize('admin', 'pharmacist'), async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: medicine });
});

app.delete('/api/medicines/:id', auth, authorize('admin'), async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

// ==================== BATCH ROUTES ====================

const calculateRisk = (expiryDate) => {
  const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return { daysLeft: days, riskLevel: days <= 0 ? 'expired' : days <= 30 ? 'critical' : days <= 60 ? 'high' : days <= 90 ? 'medium' : 'low' };
};

app.get('/api/batches', auth, async (req, res) => {
  const batches = await Batch.find().populate('medicineId', 'name category');
  res.json({ success: true, data: batches });
});

app.post('/api/batches', auth, authorize('admin', 'pharmacist'), async (req, res) => {
  const { expiryDate } = req.body;
  const { daysLeft, riskLevel } = calculateRisk(expiryDate);
  const batch = await Batch.create({ ...req.body, daysLeft, riskLevel });
  await ActivityLog.create({ userId: req.user._id, username: req.user.username, action: 'Created batch', module: 'inventory', details: batch });
  res.json({ success: true, data: batch });
});

app.get('/api/batches/priority-list', auth, async (req, res) => {
  const batches = await Batch.find({ isUsed: false, isExpired: false, quantity: { $gt: 0 } })
    .populate('medicineId', 'name').sort({ expiryDate: 1 });
  const priority = batches.map(b => ({ ...b.toObject(), ...calculateRisk(b.expiryDate) }));
  res.json({ success: true, data: priority });
});

app.get('/api/batches/heatmap', auth, async (req, res) => {
  const batches = await Batch.find({ isUsed: false, quantity: { $gt: 0 } }).populate('medicineId', 'name');
  const heatMap = { critical: [], high: [], medium: [], low: [], expired: [] };
  batches.forEach(b => {
    const { riskLevel } = calculateRisk(b.expiryDate);
    heatMap[riskLevel].push(b);
  });
  res.json({ success: true, data: heatMap });
});

app.put('/api/batches/:id/use', auth, authorize('admin', 'pharmacist', 'nurse'), async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  batch.isUsed = true;
  batch.quantity -= 1;
  await batch.save();
  await ActivityLog.create({ userId: req.user._id, username: req.user.username, action: 'Used batch', module: 'inventory', details: batch });
  res.json({ success: true, data: batch });
});

// ==================== PAYROLL ROUTES ====================

app.get('/api/payroll', auth, authorize('admin', 'manager'), async (req, res) => {
  const payroll = await Payroll.find().populate('employeeId', 'fullName department');
  res.json({ success: true, data: payroll });
});

app.post('/api/payroll', auth, authorize('admin', 'manager'), async (req, res) => {
  const { basicSalary, allowances, deductions } = req.body;
  const grossSalary = basicSalary + (allowances || 0);
  const totalDeductions = (deductions || 0);
  const netSalary = grossSalary - totalDeductions;
  const payroll = await Payroll.create({ ...req.body, grossSalary, totalDeductions, netSalary });
  res.json({ success: true, data: payroll });
});

app.put('/api/payroll/:id/pay', auth, authorize('admin', 'manager'), async (req, res) => {
  const payroll = await Payroll.findByIdAndUpdate(req.params.id, { status: 'paid', paymentDate: Date.now() }, { new: true });
  res.json({ success: true, data: payroll });
});

app.get('/api/payroll/summary', auth, authorize('admin', 'manager'), async (req, res) => {
  const { month } = req.query;
  const payroll = await Payroll.find({ month }).populate('employeeId', 'department');
  const summary = { totalPaid: 0, totalPending: 0, departments: {} };
  payroll.forEach(p => {
    if (p.status === 'paid') summary.totalPaid += p.netSalary;
    else summary.totalPending += p.netSalary;
    const dept = p.employeeId?.department || 'General';
    if (!summary.departments[dept]) summary.departments[dept] = { paid: 0, pending: 0 };
    if (p.status === 'paid') summary.departments[dept].paid += p.netSalary;
    else summary.departments[dept].pending += p.netSalary;
  });
  res.json({ success: true, data: summary });
});

// ==================== RESEARCH ROUTES ====================

app.get('/api/research', auth, async (req, res) => {
  const papers = await Research.find().populate('authors.userId', 'fullName');
  res.json({ success: true, data: papers });
});

app.post('/api/research', auth, authorize('doctor', 'admin'), async (req, res) => {
  const paper = await Research.create({ ...req.body, authors: [{ userId: req.user._id, role: 'primary' }] });
  res.json({ success: true, data: paper });
});

app.post('/api/research/:id/comment', auth, async (req, res) => {
  const paper = await Research.findByIdAndUpdate(req.params.id, 
    { $push: { comments: { userId: req.user._id, comment: req.body.comment } } }, { new: true });
  res.json({ success: true, data: paper });
});

// ==================== TASK ROUTES ====================

app.get('/api/tasks', auth, async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'fullName');
  res.json({ success: true, data: tasks });
});

app.post('/api/tasks', auth, authorize('admin', 'nurse'), async (req, res) => {
  const task = await Task.create({ ...req.body, assignedBy: req.user._id });
  res.json({ success: true, data: task });
});

app.put('/api/tasks/:id/complete', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, 
    { status: 'completed', completedAt: Date.now(), completedBy: req.user._id }, { new: true });
  res.json({ success: true, data: task });
});

// ==================== ANALYTICS ROUTES ====================

app.get('/api/analytics/dashboard', auth, async (req, res) => {
  const medicines = await Medicine.countDocuments();
  const batches = await Batch.countDocuments();
  const critical = await Batch.countDocuments({ riskLevel: 'critical', isUsed: false });
  const users = await User.countDocuments();
  res.json({ success: true, data: { medicines, batches, critical, users } });
});

// ==================== START SERVER ====================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewatch')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(5000, () => console.log('🚀 Server running on port 5000'));
  })
  .catch(err => console.log('❌ MongoDB Error:', err));
