const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: [true, 'Review comment is required'] },
}, { timestamps: true });

// One review per reviewer-reviewee-job combination
reviewSchema.index({ reviewer: 1, reviewee: 1, job: 1 }, { unique: true });

// Auto-update averageRating on the relevant profile after save/delete
const updateRating = async (revieweeId) => {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { reviewee: revieweeId } },
    { $group: { _id: '$reviewee', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const User = require('./User');
  const user = await User.findById(revieweeId);
  if (!user) return;

  const avg = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;

  if (user.role === 'jobseeker') {
    await mongoose.model('JobSeekerProfile').findOneAndUpdate(
      { user: revieweeId },
      { averageRating: Math.round(avg * 10) / 10, totalReviews: count }
    );
  } else if (user.role === 'jobposter') {
    await mongoose.model('JobPosterProfile').findOneAndUpdate(
      { user: revieweeId },
      { averageRating: Math.round(avg * 10) / 10, totalReviews: count }
    );
  }
};

reviewSchema.post('save', async function () {
  await updateRating(this.reviewee);
});

reviewSchema.post('deleteOne', { document: true }, async function () {
  await updateRating(this.reviewee);
});

module.exports = mongoose.model('Review', reviewSchema);
