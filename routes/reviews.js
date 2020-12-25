const express = require("express");
// Preserve req.params from the parent router
const router = express.Router({ mergeParams: true });

const Bird = require("../models/bird");
const Review = require("../models/review");

const { reviewSchema } = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

// ONLY USE WHEN WE'RE CREATING SOMETHING (HENCE CHECKING OUR MODEL)
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); //Check for an error as part of the object we get back
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    const review = new Review(req.body.review);
    bird.reviews.push(review);
    await review.save();
    await bird.save();
    req.flash("success", "Created new review!");
    res.redirect(`/birds/${bird._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Bird.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/birds/${id}`);
  })
);

module.exports = router;
