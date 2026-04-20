const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  apply, getMyApplications, updateApplicationStatus, withdrawApplication,
} = require('../controllers/applicationController');

router.post('/job/:jobId',        protect, authorize('jobseeker'),  apply);
router.get('/my',                 protect, authorize('jobseeker'),  getMyApplications);
router.put('/:id/status',         protect, authorize('jobposter'),  updateApplicationStatus);
router.delete('/:id/withdraw',    protect, authorize('jobseeker'),  withdrawApplication);

module.exports = router;
