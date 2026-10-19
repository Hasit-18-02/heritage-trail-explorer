  const mongoose = require('mongoose');
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['visitor', 'curator', 'guide', 'admin'], default: 'visitor', index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  }, { timestamps: true });
  module.exports = mongoose.model('User', userSchema);
