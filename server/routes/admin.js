const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = authorize('systemadmin');
const {
  getDashboardStats,
  getAllUsers, getUserById, updateUser, blockUser, unblockUser, deleteUser,
  getAllJobsAdmin, updateJobAdmin, deleteJobAdmin,
  getAllApplicationsAdmin, deleteApplicationAdmin,
  getAllReviewsAdmin, deleteReviewAdmin,
} = require('../controllers/adminController');

// All admin routes require systemadmin role
router.use(protect, admin);

router.get('/stats',                    getDashboardStats);

// Users
router.get('/users',                    getAllUsers);
router.get('/users/:id',                getUserById);
router.put('/users/:id',                updateUser);
router.put('/users/:id/block',          blockUser);
router.put('/users/:id/unblock',        unblockUser);
router.delete('/users/:id',             deleteUser);

// Jobs
router.get('/jobs',                     getAllJobsAdmin);
router.put('/jobs/:id',                 updateJobAdmin);
router.delete('/jobs/:id',              deleteJobAdmin);

// Applications
router.get('/applications',             getAllApplicationsAdmin);
router.delete('/applications/:id',      deleteApplicationAdmin);

// Reviews
router.get('/reviews',                  getAllReviewsAdmin);
router.delete('/reviews/:id',           deleteReviewAdmin);

module.exports = router;
