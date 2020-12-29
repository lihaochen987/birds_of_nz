const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { birdSchema } = require("../schemas.js");
const { isLoggedIn, isAuthor, validatePost } = require("../middleware");
const birds = require("../controllers/birds");

const ExpressError = require("../utils/ExpressError");
const Bird = require("../models/bird");

router
  .route("/")
  .get(catchAsync(birds.index))
  .post(isLoggedIn, validatePost, catchAsync(birds.createPost));

router.get("/new", isLoggedIn, birds.renderNewForm);

router
  .route("/:id")
  // Understand this more!
  .get(isLoggedIn, catchAsync(birds.showPost))
  .put(isLoggedIn, isAuthor, validatePost, catchAsync(birds.updatePost))
  .delete(isLoggedIn, isAuthor, catchAsync(birds.deletePost));

router.get("/:id/edit", isAuthor, catchAsync(birds.renderEditForm));

module.exports = router;
