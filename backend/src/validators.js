const validateUser = (data) => {
  const errors = [];
  if (!data.username) errors.push('Username is required');
  if (!data.email) errors.push('Email is required');
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (!data.fullName) errors.push('Full name is required');
  return errors;
};

const validateMedicine = (data) => {
  const errors = [];
  if (!data.name) errors.push('Medicine name is required');
  if (!data.category) errors.push('Category is required');
  return errors;
};

const validateBatch = (data) => {
  const errors = [];
  if (!data.batchNumber) errors.push('Batch number is required');
  if (!data.quantity || data.quantity < 0) errors.push('Valid quantity is required');
  if (!data.expiryDate) errors.push('Expiry date is required');
  if (!data.price || data.price < 0) errors.push('Valid price is required');
  return errors;
};

const validatePayroll = (data) => {
  const errors = [];
  if (!data.employeeId) errors.push('Employee ID is required');
  if (!data.month) errors.push('Month is required');
  if (!data.basicSalary || data.basicSalary < 0) errors.push('Valid basic salary is required');
  return errors;
};

const validateResearch = (data) => {
  const errors = [];
  if (!data.title) errors.push('Title is required');
  if (!data.abstract) errors.push('Abstract is required');
  if (!data.content) errors.push('Content is required');
  if (!data.category) errors.push('Category is required');
  return errors;
};

const validateTask = (data) => {
  const errors = [];
  if (!data.assignedTo) errors.push('Assigned user is required');
  if (!data.title) errors.push('Task title is required');
  if (!data.shift) errors.push('Shift is required');
  if (!data.date) errors.push('Date is required');
  return errors;
};

module.exports = {
  validateUser,
  validateMedicine,
  validateBatch,
  validatePayroll,
  validateResearch,
  validateTask
};
