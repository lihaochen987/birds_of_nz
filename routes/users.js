const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const User = require("../models/user");
const users = require("../controllers/users");
const { reset } = require("nodemon");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  // Not sure why this doesn't work when rerouted to a controller
  .get((req, res) => {
    res.render("users/login");
  })
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.renderLogin
  );

router.route("/forgot").get(users.renderForgot).post(users.sendResetToken);

// SETTINGS TESTING STARTS
router.get("/user/:userid/settings", async (req, res) => {
  const user = await User.findById(req.params._id);
  res.render("users/settings", { user });
});

// SETTINGS TESTING ENDS

// DASHBOARD TESTING STARTS
router.get("/user/:userid/dashboard", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/dashboard", { user });
});

router.get("/user/:userid/dashboard/changepfp", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/changePicture", { user });
});

// DASHBOARD TESTING ENDS

router
  .route("/reset/:token")
  .get(users.renderResetPage)
  .post(users.resetPassword);

router.get("/logout", users.logout);

module.exports = router;
