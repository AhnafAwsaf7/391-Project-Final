const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getReviewsForUser, deleteReview } = require('../controllers/reviewController');

router.post('/',              protect, createReview);
router.get('/user/:userId',   protect, getReviewsForUser);
router.delete('/:id',         protect, deleteReview);

module.exports = router;
