const express = require("express");
// Nested routers aren't passed any parameters from the parent by default
// Need to call the below line to merge from parent
const router = express.Router({ mergeParams: true });

const Bird = require("../models/bird");
const Comment = require("../models/comment");
const async = require("async");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, hasUpvotedComment } = require("../middleware");

router.post(
  "/upvoteComment",
  isLoggedIn,
  hasUpvotedComment,
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId);
    comment.likedBy.push(req.user._id);
    comment.likeCount += 1;
    await comment.save();
    res.redirect(`/birds/${bird._id}`);
  })
);

router.post(
    "/unupvoteComment",
    isLoggedIn,
    catchAsync(async (req, res) => {
      const bird = await Bird.findById(req.params.id);
      const comment = await Comment.findById(req.params.commentId);
      comment.likedBy.remove(req.user._id);
      comment.likeCount -= 1;
      await comment.save();
      res.redirect(`/birds/${bird._id}`);
    })
  );

module.exports = router;
