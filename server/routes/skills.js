const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllSkills, createSkill, deleteSkill } = require('../controllers/skillController');

router.get('/',         protect, getAllSkills);
router.post('/',        protect, createSkill);
router.delete('/:id',   protect, authorize('systemadmin'), deleteSkill);

module.exports = router;
