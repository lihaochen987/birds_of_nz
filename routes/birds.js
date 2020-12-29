const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { birdSchema } = require("../schemas.js");
const { isLoggedIn, isAuthor, validatePost } = require("../middleware");
const birds = require("../controllers/birds");

const ExpressError = require("../utils/ExpressError");
const Bird = require("../models/bird");

router.get("/", catchAsync(birds.index));

router.get("/new", isLoggedIn, birds.renderNewForm);

router.post("/", isLoggedIn, validatePost, catchAsync(birds.createPost));

// Understand this more!
router.get("/:id", isLoggedIn, catchAsync(birds.showPost));

router.get("/:id/edit", isAuthor, catchAsync(birds.renderEditForm));

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validatePost,
  catchAsync(birds.updatePost)
);

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(birds.deletePost));

module.exports = router;
