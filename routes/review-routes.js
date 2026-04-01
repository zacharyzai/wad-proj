const express = require('express');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');
const reviewController = require("./../controller/review-controller");

const router = express.Router();

// Review - show form and submit
router.get("/:id/review", isAuthenticated, reviewController.addReviewPage);
router.post("/:id/review", isAuthenticated, reviewController.addReview);

// Edit Review (owner only)
router.get("/:id/review/:reviewId/edit", isAuthenticated, reviewController.editReviewPageUser);
router.post("/:id/review/:reviewId/edit", isAuthenticated, reviewController.editReview);

// // Delete Review (owner only)
// router.post("/:id/review/:reviewId/delete-own", isAuthenticated, reviewController.deleteOwnReview);

// Delete Review (admin only)
router.post("/:id/review/:reviewId/delete", isAuthenticated, reviewController.deleteReview);

module.exports = router;
