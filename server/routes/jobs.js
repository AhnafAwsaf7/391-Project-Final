const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createJob, getAllJobs, getMatchedJobs, getJobById,
  getMyJobs, updateJob, deleteJob, getJobApplicants,
} = require('../controllers/jobController');

router.get('/',                   protect, getAllJobs);
router.get('/matched',            protect, authorize('jobseeker'), getMatchedJobs);
router.get('/my',                 protect, authorize('jobposter'), getMyJobs);
router.get('/:id',                protect, getJobById);
router.get('/:id/applicants',     protect, authorize('jobposter'), getJobApplicants);
router.post('/',                  protect, authorize('jobposter'), createJob);
router.put('/:id',                protect, authorize('jobposter'), updateJob);
router.delete('/:id',             protect, authorize('jobposter'), deleteJob);

module.exports = router;
