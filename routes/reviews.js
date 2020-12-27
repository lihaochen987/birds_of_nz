const express = require("express");
// Preserve req.params from the parent router
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");

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

router.post("/", validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", catchAsync(reviews.deleteReview));

module.exports = router;
