const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res, next) => {
  try {
    const { revieweeId, rating, comment, jobId } = req.body;
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) return res.status(404).json({ message: 'User not found' });
    if (String(revieweeId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      job: jobId,
      rating,
      comment,
    });
    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

exports.getReviewsForUser = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (String(review.reviewer) !== String(req.user._id) && req.user.role !== 'systemadmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};
