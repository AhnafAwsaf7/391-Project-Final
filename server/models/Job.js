const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Job title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'], default: 'freelance' },
  category: {
    type: String,
    enum: ['technology', 'design', 'writing', 'marketing', 'finance', 'legal', 'engineering', 'other'],
    default: 'other'
  },
  budget: {
    type: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  location: { type: String, default: 'Remote' },
  remote: { type: Boolean, default: true },
  deadline: { type: Date },
  status: { type: String, enum: ['open', 'closed', 'in-progress', 'completed'], default: 'open' },
  applicationsCount: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ skills: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ poster: 1 });

module.exports = mongoose.model('Job', jobSchema);
