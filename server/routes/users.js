const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobSeekerProfile,
  getJobPosterProfile,
  updateJobSeekerProfile,
  updateJobPosterProfile,
} = require('../controllers/userController');

router.get('/jobseeker/:userId',  protect, getJobSeekerProfile);
router.get('/jobposter/:userId',  protect, getJobPosterProfile);
router.put('/jobseeker/profile',  protect, authorize('jobseeker'),  updateJobSeekerProfile);
router.put('/jobposter/profile',  protect, authorize('jobposter'),  updateJobPosterProfile);

module.exports = router;
