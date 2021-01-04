const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
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

router
  .route("/reset/:token")
  .get(users.renderResetPage)
  .post(users.resetPassword);

router.get("/logout", users.logout);

module.exports = router;
