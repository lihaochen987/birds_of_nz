const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { birdSchema } = require("../schemas.js");
const { isLoggedIn, isAuthor, validatePost } = require("../middleware");

const ExpressError = require("../utils/ExpressError");
const Bird = require("../models/bird");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const birds = await Bird.find({});
    res.render("birds/index", { birds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("birds/new");
});

router.post(
  "/",
  isLoggedIn,
  validatePost,
  catchAsync(async (req, res) => {
    const bird = new Bird(req.body.bird);
    bird.author = req.user._id;
    await bird.save();
    req.flash("success", "Successfully made a new post!");
    res.redirect(`birds/${bird._id}`);
  })
);

// Understand this more!
router.get(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!bird) {
      req.flash("error", "Cannot find that post");
      return res.redirect("/birds");
    }
    res.render("birds/show", { bird });
  })
);

router.get(
  "/:id/edit",
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const bird = await Bird.findById(id);
    if (!bird) {
      req.flash("error", "Cannot find that post!");
      return res.redirect("/birds");
    }
    res.render("birds/edit", { bird });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validatePost,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const bird = await Bird.findByIdAndUpdate(id, { ...req.body.bird });
    req.flash("success", "Successfully updated a post");
    res.redirect(`${bird._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Bird.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a post");
    res.redirect("/birds");
  })
);

module.exports = router;
