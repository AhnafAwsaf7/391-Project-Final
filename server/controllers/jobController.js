const Job = require('../models/Job');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const Application = require('../models/Application');

exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, poster: req.user._id });
    await job.populate('skills');
    res.status(201).json({ success: true, job });
  } catch (err) { next(err); }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const { category, type, skills, search, status = 'open', page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (skills) filter.skills = { $in: skills.split(',') };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('poster', 'name avatar')
      .populate('skills')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: jobs.length, total, pages: Math.ceil(total / limit), jobs });
  } catch (err) { next(err); }
};

exports.getMatchedJobs = async (req, res, next) => {
  try {
    const profile = await JobSeekerProfile.findOne({ user: req.user._id });
    if (!profile || !profile.skills.length) {
      return res.json({ success: true, jobs: [], message: 'Add skills to your profile to see matched jobs' });
    }
    const jobs = await Job.find({ skills: { $in: profile.skills }, status: 'open' })
      .populate('poster', 'name avatar')
      .populate('skills')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, jobs });
  } catch (err) { next(err); }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('poster', 'name email avatar')
      .populate('skills');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) { next(err); }
};

exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ poster: req.user._id })
      .populate('skills')
      .sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, poster: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    Object.assign(job, req.body);
    await job.save();
    await job.populate('skills');
    res.json({ success: true, job });
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, poster: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};

exports.getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, poster: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    const applications = await Application.find({ job: job._id })
      .populate({ path: 'applicant', select: 'name email avatar isFlagged flagReason' })
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) { next(err); }
};
