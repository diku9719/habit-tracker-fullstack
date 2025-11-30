const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['health', 'productivity', 'learning', 'mindfulness', 'social', 'finance', 'creativity', 'other']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  color: {
    type: String,
    required: true,
    default: '#667eea'
  },
  completions: [{
    type: String // Date in YYYY-MM-DD format
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
HabitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Habit', HabitSchema);
