const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Review = require('../models/Review');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const JobPosterProfile = require('../models/JobPosterProfile');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalApplications, totalReviews,
           jobseekers, jobposters, openJobs, closedJobs] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'jobposter' }),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'closed' }),
    ]);
    res.json({ success: true, stats: {
      totalUsers, totalJobs, totalApplications, totalReviews,
      jobseekers, jobposters, openJobs, closedJobs
    }});
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, users });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let profile = null;
    if (user.role === 'jobseeker') profile = await JobSeekerProfile.findOne({ user: user._id }).populate('skills');
    if (user.role === 'jobposter') profile = await JobPosterProfile.findOne({ user: user._id });
    res.json({ success: true, user, profile });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isVerified },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User blocked', user });
  } catch (err) { next(err); }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User unblocked', user });
  } catch (err) { next(err); }
};

exports.flagUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: reason || 'Flagged by admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User flagged', user });
  } catch (err) { next(err); }
};

exports.unflagUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFlagged: false, flagReason: '' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User unflagged', user });
  } catch (err) { next(err); }
};

exports.getSeekerHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profile = await JobSeekerProfile.findOne({ user: user._id }).populate('skills');

    const applications = await Application.find({ applicant: user._id })
      .populate({ path: 'job', populate: { path: 'poster', select: 'name email' } })
      .sort({ createdAt: -1 });

    const reviewsWritten = await Review.find({ reviewer: user._id })
      .populate('reviewee', 'name email role')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    const reviewsReceived = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, user, profile, applications, reviewsWritten, reviewsReceived });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await JobSeekerProfile.deleteOne({ user: user._id });
    await JobPosterProfile.deleteOne({ user: user._id });
    await Application.deleteMany({ applicant: user._id });
    await Review.deleteMany({ $or: [{ reviewer: user._id }, { reviewee: user._id }] });
    await user.deleteOne();
    res.json({ success: true, message: 'User and all related data deleted' });
  } catch (err) { next(err); }
};

exports.getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('poster', 'name email')
      .populate('skills')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, jobs });
  } catch (err) { next(err); }
};

exports.updateJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('skills').populate('poster', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) { next(err); }
};

exports.deleteJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};

exports.getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('job', 'title')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, applications });
  } catch (err) { next(err); }
};

exports.deleteApplicationAdmin = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    await Job.findByIdAndUpdate(app.job, { $inc: { applicationsCount: -1 } });
    await app.deleteOne();
    res.json({ success: true, message: 'Application deleted' });
  } catch (err) { next(err); }
};

exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('reviewer', 'name email isFlagged')
      .populate('reviewee', 'name email isFlagged')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, reviews });
  } catch (err) { next(err); }
};

exports.deleteReviewAdmin = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};