const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

// REQUIRE TEST
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const { isLoggedIn, isAuthor } = require("../middleware");
const Bird = require("../models/bird");
const User = require("../models/user");
const Comment = require("../models/comment");
const users = require("../controllers/users");
const { reset } = require("nodemon");
var ObjectId = require("mongodb").ObjectID;

router
  .route("/register")
  .get(users.renderRegister)
  .post(upload.single("image"), catchAsync(users.register));

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

router.get("/user/:userid/settings", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/settings", { user });
});

router
  .route("/user/:userid/settings/changepassword")
  .get(isLoggedIn, users.renderChangePassword)
  .put(users.changePassword);

router
  .route("/user/:userid/settings/changepfp")
  .get(isLoggedIn, users.renderChangeProfilePicture)
  .post(isLoggedIn, upload.single("image"), users.changeProfilePicture);

router.get("/user/:userid/dashboard", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  console.log(user);
  res.render("users/dashboard", { user });
});

router
  .route("/reset/:token")
  .get(users.renderResetPage)
  .post(users.resetPassword);

router.get("/logout", users.logout);

module.exports = router;
