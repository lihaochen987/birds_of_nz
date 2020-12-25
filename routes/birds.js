const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { birdSchema } = require("../schemas.js");

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

router.get(
  "/",
  catchAsync(async (req, res) => {
    const birds = await Bird.find({});
    res.render("birds/index", { birds });
  })
);

router.get("/new", (req, res) => {
  res.render("birds/new");
});

router.post(
  "/",
  validatePost,
  catchAsync(async (req, res) => {
    if (!req.body.bird) throw new ExpressError("Invalid Post Data", 400);
    const bird = new Bird(req.body.bird);
    await bird.save();
    res.redirect(`birds/${bird._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id).populate("reviews");
    res.render("birds/show", { bird });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    res.render("birds/edit", { bird });
  })
);

router.put(
  "/:id",
  validatePost,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const bird = await Bird.findByIdAndUpdate(id, { ...req.body.bird });
    res.redirect(`${bird._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Bird.findByIdAndDelete(id);
    res.redirect("/birds");
  })
);

module.exports = router;