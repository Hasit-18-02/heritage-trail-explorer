const mongoose = require('mongoose');
const placeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  city: { type: String, required: true, trim: true, index: true },
  address: { type: String, default: '' },
  summary: { type: String, required: true, maxlength: 1200 },
  history: { type: String, default: '', maxlength: 12000 },
  category: { type: String, default: 'heritage' },
  visitingHours: { type: String, default: 'Check locally before visiting' },
  visitDurationMinutes: { type: Number, default: 45, min: 5, max: 1440 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  sources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
}, { timestamps: true });
placeSchema.index({ name: 'text', summary: 'text', history: 'text', city: 'text' });
module.exports = mongoose.model('Place', placeSchema);
