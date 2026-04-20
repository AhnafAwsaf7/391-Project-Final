const mongoose = require('mongoose');

const jobSeekerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  headline: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  experience: [{
    title: String,
    company: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String,
  }],
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
  }],
  portfolio: [{ title: String, url: String, description: String }],
  hourlyRate: { type: Number, default: 0 },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
