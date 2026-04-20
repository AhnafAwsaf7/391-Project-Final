const Skill = require('../models/Skill');

exports.getAllSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const skills = await Skill.find(filter).sort({ name: 1 });
    res.json({ success: true, skills });
  } catch (err) { next(err); }
};

exports.createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, skill });
  } catch (err) { next(err); }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) { next(err); }
};
