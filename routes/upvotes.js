const express = require("express");
// Nested routers aren't passed any parameters from the parent by default
// Need to call the below line to merge from parent
const router = express.Router({ mergeParams: true });

const Bird = require("../models/bird");
const async = require("async");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    bird.likedBy.push(req.user._id);
    bird.likeCount += 1;
    await bird.save();
    res.redirect(`/birds/${bird._id}`);
  })
);

module.exports = router;
