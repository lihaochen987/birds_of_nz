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

router.get("/", catchAsync(birds.index));

router.get("/new", isLoggedIn, birds.renderNewForm);

router.post("/", isLoggedIn, validatePost, catchAsync(birds.createPost));

router.get("/:id", isLoggedIn, catchAsync(birds.showPost));

router.get("/:id/edit", isLoggedIn, catchAsync(birds.renderEditForm));

router.put("/:id", isLoggedIn, validatePost, catchAsync(birds.updatePost));

router.delete("/:id", isLoggedIn, catchAsync(birds.deletePost));

module.exports = router;
