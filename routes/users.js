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

// Testing code (starts)
router.get("/forgot", function (req, res) {
  res.render("users/forgot", {
    user: req.user,
  });
});

// Testing code (ends)

router.get("/logout", users.logout);

module.exports = router;
