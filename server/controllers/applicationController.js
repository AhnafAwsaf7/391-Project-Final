const Application = require('../models/Application');
const Job = require('../models/Job');

exports.apply = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open for applications' });

    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) return res.status(409).json({ message: 'You already applied to this job' });

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      proposedRate: req.body.proposedRate,
    });
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });
    await application.populate('job');
    res.status(201).json({ success: true, application });
  } catch (err) { next(err); }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({ path: 'job', populate: { path: 'poster', select: 'name avatar' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) { next(err); }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Ensure only the job poster can update status
    if (String(application.job.poster) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.status = status;
    if (note !== undefined) application.note = note;
    await application.save();
    res.json({ success: true, application });
  } catch (err) { next(err); }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, applicant: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
    await application.deleteOne();
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) { next(err); }
};
