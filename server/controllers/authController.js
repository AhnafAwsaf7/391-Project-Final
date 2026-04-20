const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const JobPosterProfile = require('../models/JobPosterProfile');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['jobseeker', 'jobposter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Choose jobseeker or jobposter.' });
    }
    const user = await User.create({ name, email, password, role });

    // Auto-create profile
    if (role === 'jobseeker') await JobSeekerProfile.create({ user: user._id });
    if (role === 'jobposter') await JobPosterProfile.create({ user: user._id });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });

    const token = signToken(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, token, user: userObj });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'jobseeker') profile = await JobSeekerProfile.findOne({ user: user._id }).populate('skills');
    if (user.role === 'jobposter') profile = await JobPosterProfile.findOne({ user: user._id });
    res.json({ success: true, user, profile });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
