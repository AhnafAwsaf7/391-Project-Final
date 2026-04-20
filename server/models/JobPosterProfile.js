const mongoose = require('mongoose');

const jobPosterProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  industry: { type: String, default: '' },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], default: '1-10' },
  location: { type: String, default: '' },
  logo: { type: String, default: '' },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('JobPosterProfile', jobPosterProfileSchema);
