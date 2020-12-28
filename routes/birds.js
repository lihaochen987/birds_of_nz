const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { birdSchema } = require("../schemas.js");
const { isLoggedIn } = require("../middleware");
const birds = require("../controllers/birds");

const ExpressError = require("../utils/ExpressError");
const Bird = require("../models/bird");

// Not entirely sure what this does
const validatePost = (req, res, next) => {
  const { error } = birdSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.route("/")
.get(catchAsync(birds.index))
.post(isLoggedIn, validatePost, catchAsync(birds.createPost));

router.route("/:id")
.get(isLoggedIn, catchAsync(birds.showPost))
.put(isLoggedIn, validatePost, catchAsync(birds.updatePost))
.delete(isLoggedIn, catchAsync(birds.deletePost));

router.get("/new", isLoggedIn, birds.renderNewForm);

router.get("/:id/edit", isLoggedIn, catchAsync(birds.renderEditForm));

module.exports = router;
