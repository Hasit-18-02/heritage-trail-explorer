const mongoose = require('mongoose');
module.exports = mongoose.model('Trail', new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: '', maxlength: 1500 },
  city: { type: String, required: true, trim: true },
  places: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true }],
  estimatedMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }));
