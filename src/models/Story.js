  const mongoose = require('mongoose');
  module.exports = mongoose.model('Story', new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    body: { type: String, required: true, maxlength: 30000 },
    sourceTitle: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    visibility: { type: String, enum: ['editorial', 'public'], default: 'editorial', index: true },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  }, { timestamps: true }));
