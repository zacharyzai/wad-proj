const Review = require("../models/review-models"); // added for review
const Event = require("../models/event-models");


// To view the Add Review Page
exports.addReviewPage = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.send("Event not found.");
        }
        res.render("create-review", { event });
    } catch (err) {
        console.error(err);
        res.send("Error loading review page.");
    }
};


// To add review
exports.addReview = async (req, res) => {
    try {
        const { title, rating, comment } = req.body;

        if (!title || !rating || !comment) {
            return res.redirect("/events/" + req.params.id);
        }

        const review = await Review.create({
            event: req.params.id,
            user: req.session.userId,
            title,
            rating,
            comment
        });

        // Push the review ID into the event's reviews array
        await Event.findByIdAndUpdate(req.params.id, {
            $push: { reviews: review._id }
        });

        res.redirect("/events/" + req.params.id);
    } catch (err) {
        console.error(err);
        res.send("Error adding review.");
    }
};

// Edit Review Page (FOR USER TO EDIT THEIR OWN REVIEWS)
exports.editReviewPageUser = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) return res.send("Review not found.");

        // Check if the logged-in user owns this review
        if (review.user.toString() !== req.session.userId) {
            return res.send("Unauthorized: You can only edit your own reviews.");
        }

        res.render("edit-review", { review, eventId: req.params.id });
    } catch (err) {
        console.error(err);
        res.send("Error loading edit review page.");
    }
};

// Update Review (only review owner) check
exports.editReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.send("Review not found.");
        }

        if (review.user.toString() !== req.session.userId) {
            return res.send("You are not allowed to edit this review.");
        }

        review.title = req.body.title;
        review.rating = req.body.rating;
        review.comment = req.body.comment;

        await review.save();

        res.redirect("/events/" + req.params.id);
    } catch (err) {
        console.error(err);
        res.send("Error loading edit page.");
    }
};

// Delete Review (owner or admin)
exports.deleteReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) return res.send("Review not found.");

        // Allow if admin OR the review owner
        const isOwner = review.user.toString() === req.session.userId;
        const isAdmin = req.session.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.send("Unauthorized: You cannot delete this review.");
        }

        await Review.findByIdAndDelete(reviewId);
        await Event.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        res.redirect("/events/" + id);
    } catch (err) {
        console.error(err);
        res.send("Error deleting review.");
    }
};

// Delete Review (user) check
exports.deleteOwnReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) return res.send("Review not found.");

        if (review.user.toString() !== req.session.userId) {
            return res.send("Unauthorized: You can only delete your own reviews.");
        }

        await Review.findByIdAndDelete(reviewId);
        await Event.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        res.redirect("/events/" + id);
    } catch (err) {
        console.error(err);
        res.send("Error deleting review.");
    }
};
