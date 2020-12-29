const express = require("express");
// Preserve req.params from the parent router
const router = express.Router({ mergeParams: true });

const Bird = require("../models/bird");
const Comment = require("../models/comment");
const comments = require("../controllers/comments");

const { commentSchema } = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const { validateComment, isLoggedIn, isCommentAuthor } = require("../middleware");

router.post("/", isLoggedIn, validateComment, catchAsync(comments.createComment));

router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  catchAsync(comments.deleteComment)
);

module.exports = router;
