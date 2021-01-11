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

// SETTINGS TESTING STARTS
router.get("/user/:userid/settings", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/settings", { user });
});

router.get(
  "/user/:userid/settings/changepassword",
  isLoggedIn,
  async (req, res) => {
    const user = await User.findById(req.params.userid);
    res.render("users/settings/changePassword", { user });
  }
);

router.get("/user/:userid/settings/changepfp", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/settings/changeProfilePicture", { user });
});

router.post(
  "/user/:userid/settings/changepfp",
  isLoggedIn,
  upload.single("image"),
  async (req, res) => {
    const { userid } = req.params;
    const user = await User.findById(userid);
    user.avatar.url = req.file.path;
    await user.save();
    req.flash("success", "Successfully updated your profile picture!");
    res.redirect(`/user/${user._id}/settings/changepfp`);
  }
);

router.put("/user/:userid/settings/changepassword", async (req, res) => {
  const user = await User.findById(req.params.userid);
  if (req.body.newpassword === req.body.confirmpassword) {
    user.changePassword(req.body.oldpassword, req.body.newpassword);
    await user.save();
    req.flash("success", "Successfully changed your password!");
    res.redirect("/birds");
  } else {
    req.flash(
      "error",
      "Either the old password is wrong or the new and confirm password do not match up!"
    );
    res.redirect(`/user/${user._id}/settings/changepassword`);
  }
});

// SETTINGS TESTING ENDS

// DASHBOARD TESTING STARTS

router.get("/user/:userid/dashboard", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.userid);
  console.log(user);
  res.render("users/dashboard", { user });
});

// DASHBOARD TESTING ENDS

router
  .route("/reset/:token")
  .get(users.renderResetPage)
  .post(users.resetPassword);

router.get("/logout", users.logout);

module.exports = router;
