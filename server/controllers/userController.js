const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const JobPosterProfile = require('../models/JobPosterProfile');

exports.getJobSeekerProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'jobseeker') return res.status(404).json({ message: 'Profile not found' });
    const profile = await JobSeekerProfile.findOne({ user: user._id }).populate('skills');
    res.json({ success: true, user, profile });
  } catch (err) { next(err); }
};

exports.getJobPosterProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'jobposter') return res.status(404).json({ message: 'Profile not found' });
    const profile = await JobPosterProfile.findOne({ user: user._id });
    res.json({ success: true, user, profile });
  } catch (err) { next(err); }
};

exports.updateJobSeekerProfile = async (req, res, next) => {
  try {
    const profile = await JobSeekerProfile.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('skills');
    // Also update user name/avatar if provided
    if (req.body.name || req.body.avatar) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.avatar && { avatar: req.body.avatar }),
      });
    }
    res.json({ success: true, profile });
  } catch (err) { next(err); }
};

exports.updateJobPosterProfile = async (req, res, next) => {
  try {
    const profile = await JobPosterProfile.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (req.body.name || req.body.avatar) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.avatar && { avatar: req.body.avatar }),
      });
    }
    res.json({ success: true, profile });
  } catch (err) { next(err); }
};
