const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const { reset } = require("nodemon");

// Testing required
const async = require("async");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const flash = require("express-flash");

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

router.post("/forgot", function (req, res, next) {
  const username = process.env.NODEMAILER_USERNAME;
  const password = process.env.NODEMAILER_PASSWORD;
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/forgot");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: username,
          pass: password,
        },
      });
      var mailOptions = {
        to: user.email,
        from: username,
        subject: "Node.js Password Reset",
        text:
          "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
          "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
          "http://" +
          req.headers.host +
          "/reset/" +
          token +
          "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    },
  ]);
  req.flash("success", "Successfully reset your email!");
  res.redirect("/birds");
});

// Testing code (ends)

router.get("/logout", users.logout);

module.exports = router;
