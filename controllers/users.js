require("dotenv").config();
const nodemailer = require("nodemailer");
const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Birds of New Zealand!");
      res.redirect("/birds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
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

module.exports.renderReset = (req, res) => {
  res.render("users/reset");
};

module.exports.resetUser = (req, res, next) => {
  const username = process.env.NODEMAILER_USERNAME;
  const password = process.env.NODEMAILER_PASSWORD;
  const userEmail = req.body.email;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: username,
      pass: password,
    },
  });
  const mailOptions = {
    from: username,
    to: userEmail,
    subject: "Reset your Birds Of New Zealand password",
    html: `<h1> Want to reset your password? </h1>
    <p>Someone recently requested a password change for your Birds of New Zealand account. If this was you, click the button to set a new password</p>
    <button>Reset Password</button>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  req.flash("Successfully reset your email!");
  res.redirect("/birds");
};
