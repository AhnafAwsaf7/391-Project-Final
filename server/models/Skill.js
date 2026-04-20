const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  category: {
    type: String,
    enum: ['technology', 'design', 'writing', 'marketing', 'finance', 'legal', 'engineering', 'other'],
    default: 'other'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
