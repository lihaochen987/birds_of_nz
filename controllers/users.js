require("dotenv").config();
const User = require("../models/user");
const async = require("async");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const flash = require("express-flash");
const bodyParser = require("body-parser");

const passwordResetEmailHtml = require("../public/nodemailer/nodemailerForgot");
const passwordResetConfirmationEmailHtml = require("../public/nodemailer/nodemailerReset");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    console.log(req);
    const { email, username, password } = req.body;
    const { path, filename } = req.file;
    const user = new User({
      email,
      username,
      password,
      avatar: { url: path, filename: filename },
    });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Birds of New Zealand!");
      res.redirect("/birds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  req.flash("success", "Welcome Back!");
  const redirectUrl = req.session.returnTo || "/birds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Thank you for visiting Birds of New Zealand!");
  res.redirect("/birds");
};

module.exports.renderForgot = function (req, res) {
  res.render("users/forgot", {
    user: req.user,
  });
};

module.exports.sendResetToken = function (req, res, next) {
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
      const websiteLink = req.headers.host;
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NODEMAILER_USERNAME,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });
      var mailOptions = {
        to: user.email,
        from: process.env.NODEMAILER_USERNAME,
        subject: "Birds of New Zealand password reset",
        html: passwordResetEmailHtml(token, websiteLink, done),
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
  req.flash("success", "We have sent an email with further instructions");
  res.redirect("/birds");
};

module.exports.renderResetPage = function (req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("users/reset", {
        token: req.params.token,
      });
    }
  );
};

module.exports.resetPassword = function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }

            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function (err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                  req.logIn(user, function (err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match!");
              return res.redirect("back");
            }
          }
        );
      },
      function (user, done) {
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.NODEMAILER_USERNAME,
            pass: process.env.NODEMAILER_PASSWORD,
          },
        });
        var mailOptions = {
          to: user.email,
          from: process.env.NODEMAILER_USERNAME,
          subject: "Your password has been changed",
          html: passwordResetConfirmationEmailHtml(user, done),
        };
        transporter.sendMail(mailOptions, function (err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      },
    ],
    function (err) {
      res.redirect("/birds");
    }
  );
};

module.exports.renderChangePassword = async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/settings/changePassword", { user });
};

module.exports.changePassword = async (req, res) => {
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
};

module.exports.renderChangeProfilePicture = async (req, res) => {
  const user = await User.findById(req.params.userid);
  res.render("users/settings/changeProfilePicture", { user });
};

module.exports.changeProfilePicture = async (req, res) => {
  const { userid } = req.params;
  const user = await User.findById(userid);
  user.avatar.url = req.file.path;
  await user.save();
  req.flash("success", "Successfully updated your profile picture!");
  res.redirect(`/birds`);
};
