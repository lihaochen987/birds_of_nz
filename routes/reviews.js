const express = require("express");
// Preserve req.params from the parent router
const router = express.Router({ mergeParams: true });

const Bird = require("../models/bird");
const Review = require("../models/review");

const { reviewSchema } = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    bird.reviews.push(review);
    await review.save();
    await bird.save();
    req.flash("success", "Created new review!");
    res.redirect(`/birds/${bird._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Bird.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/birds/${id}`);
  })
);

module.exports = router;
