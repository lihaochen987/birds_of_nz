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
const bodyParser = require("body-parser");

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
          user: process.env.NODEMAILER_USERNAME,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });
      var mailOptions = {
        to: user.email,
        from: process.env.NODEMAILER_USERNAME,
        subject: "Birds of New Zealand password reset",
        html:
          `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background: #f1f1f1;margin: 0 auto !important;padding: 0 !important;height: 100% !important;width: 100% !important;">
          <head style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <meta charset="utf-8" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <!-- utf-8 works for most cases -->
            <meta name="viewport" content="width=device-width" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <!-- Forcing initial-scale shouldn't be necessary -->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <!-- Use the latest (edge) version of IE rendering engine -->
            <meta name="x-apple-disable-message-reformatting" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <!-- Disable auto-scale in iOS 10 Mail entirely -->
            <title style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"></title>
            <!-- The title tag shows in email notifications, like Android 4.4. -->
        
            <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:200,300,400,600,700,800,900" rel="stylesheet" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <link href="https://fonts.googleapis.com/css2?family=Andika+New+Basic&display=swap" rel="stylesheet" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
        
            <!-- CSS Reset : BEGIN -->
            <style style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              /* What it does: Remove spaces around the email design added by some email clients. */
              /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
              html,
              body {
                margin: 0 auto !important;
                padding: 0 !important;
                height: 100% !important;
                width: 100% !important;
                background: #f1f1f1;
              }
        
              /* What it does: Stops email clients resizing small text. */
              * {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
              }
        
              /* What it does: Centers email on Android 4.4 */
              div[style*="margin: 16px 0"] {
                margin: 0 !important;
              }
        
              /* What it does: Stops Outlook from adding extra spacing to tables. */
              table,
              td {
                mso-table-lspace: 0pt !important;
                mso-table-rspace: 0pt !important;
              }
        
              /* What it does: Fixes webkit padding issue. */
              table {
                border-spacing: 0 !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                margin: 0 auto !important;
              }
        
              /* What it does: Uses a better rendering method when resizing images in IE. */
              img {
                -ms-interpolation-mode: bicubic;
              }
        
              /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
              a {
                text-decoration: none;
              }
        
              /* What it does: A work-around for email clients meddling in triggered links. */
              *[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links *,
        .aBn {
                border-bottom: 0 !important;
                cursor: default !important;
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
              }
        
              /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
              .a6S {
                display: none !important;
                opacity: 0.01 !important;
              }
        
              /* What it does: Prevents Gmail from changing the text color in conversation threads. */
              .im {
                color: inherit !important;
              }
        
              /* If the above doesn't work, add a .g-img class to any image in question. */
              img.g-img + div {
                display: none !important;
              }
        
              /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
              /* Create one of these media queries for each additional viewport size you'd like to fix */
        
              /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
              @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                u ~ div .email-container {
                  min-width: 320px !important;
                }
              }
              /* iPhone 6, 6S, 7, 8, and X */
              @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                u ~ div .email-container {
                  min-width: 375px !important;
                }
              }
              /* iPhone 6+, 7+, and 8+ */
              @media only screen and (min-device-width: 414px) {
                u ~ div .email-container {
                  min-width: 414px !important;
                }
              }
            </style>
        
            <!-- CSS Reset : END -->
        
            <!-- Progressive Enhancements : BEGIN -->
            <style style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              .email-section{
                padding:2.5em;
              }
        
              /*BUTTON*/
              .btn{
                font-weight:400;
                display: inline-block;
                text-align: center;
                white-space:no-wrap;
                vertical-align: middle;
                border: 1px solid transparent;
                padding: .375rem .75rem;
                font-size: 1rem;
                line-height: 1.5;
                border-radius: .25rem;
              }
              .btn-primary{
                color: #fff;
                background-color: #007bff;
                border-color: #007bff;
              }
        
              h1,h2,h3,h4,h5,h6{
                font-family: 'Nunito Sans', sans-serif;
                color: #000000;
                margin-top: 0;
              }
        
              body{
                font-family: 'Nunito Sans', sans-serif;
                font-weight: 400;
                font-size: 15px;
                line-height: 1.8;
                color: rgba(0,0,0,.4);
              }
        
              a{
                color: #f5564e;
              }
        
              /*HERO*/
              .hero{
                position: relative;
                z-index: 0;
              }
              .hero .overlay{
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                content: '';
                width: 100%;
                background: #000000;
                z-index: -1;
                opacity: .3;
              }
              .hero .icon{
              }
              .hero .icon a{
                display: block;
                width: 60px;
                margin: 0 auto;
              }
              .hero .text{
                color: rgba(255,255,255,.8);
                padding: 0 4em;
              }
              .hero .text h2{
                color: #ffffff;
                font-size: 40px;
                margin-bottom: 0;
                line-height: 1.2;
                font-weight: 900;
              }
        
        
              /*HEADING SECTION*/
              .heading-section{
              }
              .heading-section h2{
                color: #000000;
                font-size: 24px;
                margin-top: 0;
                line-height: 1.4;
                font-weight: 700;
              }
              .heading-section .subheading{
                margin-bottom: 20px !important;
                display: inline-block;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(0,0,0,.4);
                position: relative;
              }
              .heading-section .subheading::after{
                position: absolute;
                left: 0;
                right: 0;
                bottom: -10px;
                content: '';
                width: 100%;
                height: 2px;
                background: #f5564e;
                margin: 0 auto;
              }
        
              .heading-section-white{
                color: rgba(255,255,255,.8);
              }
              .heading-section-white h2{
                font-family:
                line-height: 1;
                padding-bottom: 0;
              }
        
              .heading-section-white h2{
                color: #ffffff;
              }
              .heading-section-white .subheading{
                margin-bottom: 0;
                display: inline-block;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(255,255,255,.4);
              }
        
        
              .icon{
                text-align: center;
              }
              .icon img{
              }
        
              @media screen and (max-width: 500px) {
        
                .icon{
                  text-align: left;
                }
        
                .text-services{
                  padding-left: 0;
                  padding-right: 20px;
                  text-align: left;
                }
        
              }
            </style>
          </head>
          <body width="100%" style="margin: 0 auto !important;padding: 0 !important;mso-line-height-rule: exactly;background-color: #222222;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background: #f1f1f1;font-family: 'Nunito Sans', sans-serif;font-weight: 400;font-size: 15px;line-height: 1.8;color: rgba(0,0,0,.4);height: 100% !important;width: 100% !important;">
            <center style="width: 100%;background-color: #f1f1f1;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <div style="display: none;font-size: 1px;max-height: 0px;max-width: 0px;opacity: 0;overflow: hidden;mso-hide: all;font-family: sans-serif;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
              </div>
              <div style="max-width: 600px;margin: 0 auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="email-container">
                <!-- BEGIN BODY -->
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;">
                  <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                    <td valign="top" style="padding: 1em 2.5em;background-color: #6f8c5f;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
                        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                          <td width="40%" class="logo" style="text-align: left;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                            <h1 style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;font-family: 'Nunito Sans', sans-serif;color: #000000;margin-top: 0;">
                              <img src="https://res.cloudinary.com/dabgwgfzh/image/upload/v1609657863/BirdsOfNewZealand/emailWebsiteLogo/logofull_tecjeq.png" alt="Birds of New Zealand logo" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;-ms-interpolation-mode: bicubic;">
                            </h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- end tr -->
                  <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                    <td valign="middle" class="hero bg_white" style="background-image: url(https://source.unsplash.com/collection/36390090/1600x900);background-size: cover;height: 400px;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;position: relative;z-index: 0;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                      <div class="overlay" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;position: absolute;top: 0;left: 0;right: 0;bottom: 0;content: '';width: 100%;background: #000000;z-index: -1;opacity: .3;"></div>
                      <table style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
                        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                          <td style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                            <div class="text" style="text-align: center;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: rgba(255,255,255,.8);padding: 0 4em;">
                              <h2 style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;font-family: 'Nunito Sans', sans-serif;color: #ffffff;margin-top: 0;font-size: 40px;margin-bottom: 0;line-height: 1.2;font-weight: 900;">Want to reset your password?</h2>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- end tr -->
                  <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                    <td class="email-section" style="background-color: #d4d0cb;text-align: center;font-family: 'Andika New Basic', sans-serif;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;padding: 2.5em;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                      <div class="heading-section heading-section-white" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: rgba(255,255,255,.8);">
                        <p style="color: black;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                          You are receiving this because you (or someone else) have
                          requested the reset of the password for your account. Please
                          click the button below to complete the process:
                        </p>
                        <p style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                          <a href="http://${req.headers.host}/reset/${token}" class="btn btn-primary" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;text-decoration: none;color: #fff;font-weight: 400;display: inline-block;text-align: center;white-space: no-wrap;vertical-align: middle;border: 1px solid transparent;padding: .375rem .75rem;font-size: 1rem;line-height: 1.5;border-radius: .25rem;background-color: #007bff;border-color: #007bff;">Reset Password
                        </a></p>
                        <p style="color: black;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                          Please paste the link below into your browser if the button
                          doesn't work 😄
                        </p>
                        <p style="color: black;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                          http://` +
          req.headers.host +
          `/reset/` +
          token +
          `
                        </p>
                      </div>
                    </td>
                  </tr>
                  <!-- end: tr -->
                </table>
              </div>
            </center>
          </body>
        </html>
        `,
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
});

router.get("/reset/:token", function (req, res) {
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
        // user: req.user,
      });
    }
  );
});

router.post("/reset/:token", function (req, res) {
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
          html: `<!DOCTYPE html>
          <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background: #f1f1f1;margin: 0 auto !important;padding: 0 !important;height: 100% !important;width: 100% !important;">
            <head style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <meta charset="utf-8" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <!-- utf-8 works for most cases -->
              <meta name="viewport" content="width=device-width" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <!-- Forcing initial-scale shouldn't be necessary -->
              <meta http-equiv="X-UA-Compatible" content="IE=edge" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <!-- Use the latest (edge) version of IE rendering engine -->
              <meta name="x-apple-disable-message-reformatting" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <!-- Disable auto-scale in iOS 10 Mail entirely -->
              <title style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"></title>
              <!-- The title tag shows in email notifications, like Android 4.4. -->
          
              <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:200,300,400,600,700,800,900" rel="stylesheet" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
              <link href="https://fonts.googleapis.com/css2?family=Andika+New+Basic&display=swap" rel="stylesheet" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
          
              <!-- CSS Reset : BEGIN -->
              <style style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                /* What it does: Remove spaces around the email design added by some email clients. */
                /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                html,
                body {
                  margin: 0 auto !important;
                  padding: 0 !important;
                  height: 100% !important;
                  width: 100% !important;
                  background: #f1f1f1;
                }
          
                /* What it does: Stops email clients resizing small text. */
                * {
                  -ms-text-size-adjust: 100%;
                  -webkit-text-size-adjust: 100%;
                }
          
                /* What it does: Centers email on Android 4.4 */
                div[style*="margin: 16px 0"] {
                  margin: 0 !important;
                }
          
                /* What it does: Stops Outlook from adding extra spacing to tables. */
                table,
                td {
                  mso-table-lspace: 0pt !important;
                  mso-table-rspace: 0pt !important;
                }
          
                /* What it does: Fixes webkit padding issue. */
                table {
                  border-spacing: 0 !important;
                  border-collapse: collapse !important;
                  table-layout: fixed !important;
                  margin: 0 auto !important;
                }
          
                /* What it does: Uses a better rendering method when resizing images in IE. */
                img {
                  -ms-interpolation-mode: bicubic;
                }
          
                /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
                a {
                  text-decoration: none;
                }
          
                /* What it does: A work-around for email clients meddling in triggered links. */
                *[x-apple-data-detectors],  /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
                  border-bottom: 0 !important;
                  cursor: default !important;
                  color: inherit !important;
                  text-decoration: none !important;
                  font-size: inherit !important;
                  font-family: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                }
          
                /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
                .a6S {
                  display: none !important;
                  opacity: 0.01 !important;
                }
          
                /* What it does: Prevents Gmail from changing the text color in conversation threads. */
                .im {
                  color: inherit !important;
                }
          
                /* If the above doesn't work, add a .g-img class to any image in question. */
                img.g-img + div {
                  display: none !important;
                }
          
                /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
                /* Create one of these media queries for each additional viewport size you'd like to fix */
          
                /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
                @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                  u ~ div .email-container {
                    min-width: 320px !important;
                  }
                }
                /* iPhone 6, 6S, 7, 8, and X */
                @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                  u ~ div .email-container {
                    min-width: 375px !important;
                  }
                }
                /* iPhone 6+, 7+, and 8+ */
                @media only screen and (min-device-width: 414px) {
                  u ~ div .email-container {
                    min-width: 414px !important;
                  }
                }
              </style>
          
              <!-- CSS Reset : END -->
          
              <!-- Progressive Enhancements : BEGIN -->
              <style style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                .email-section{
                  padding:2.5em;
                }
          
                /*BUTTON*/
                .btn{
                  font-weight:400;
                  display: inline-block;
                  text-align: center;
                  white-space:no-wrap;
                  vertical-align: middle;
                  border: 1px solid transparent;
                  padding: .375rem .75rem;
                  font-size: 1rem;
                  line-height: 1.5;
                  border-radius: .25rem;
                }
                .btn-primary{
                  color: #fff;
                  background-color: #007bff;
                  border-color: #007bff;
                }
          
                h1,h2,h3,h4,h5,h6{
                  font-family: 'Nunito Sans', sans-serif;
                  color: #000000;
                  margin-top: 0;
                }
          
                body{
                  font-family: 'Nunito Sans', sans-serif;
                  font-weight: 400;
                  font-size: 15px;
                  line-height: 1.8;
                  color: rgba(0,0,0,.4);
                }
          
                a{
                  color: #f5564e;
                }
          
                /*HERO*/
                .hero{
                  position: relative;
                  z-index: 0;
                }
                .hero .overlay{
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  content: '';
                  width: 100%;
                  background: #000000;
                  z-index: -1;
                  opacity: .3;
                }
                .hero .icon{
                }
                .hero .icon a{
                  display: block;
                  width: 60px;
                  margin: 0 auto;
                }
                .hero .text{
                  color: rgba(255,255,255,.8);
                  padding: 0 4em;
                }
                .hero .text h2{
                  color: #ffffff;
                  font-size: 40px;
                  margin-bottom: 0;
                  line-height: 1.2;
                  font-weight: 900;
                }
          
          
                /*HEADING SECTION*/
                .heading-section{
                }
                .heading-section h2{
                  color: #000000;
                  font-size: 24px;
                  margin-top: 0;
                  line-height: 1.4;
                  font-weight: 700;
                }
                .heading-section .subheading{
                  margin-bottom: 20px !important;
                  display: inline-block;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  color: rgba(0,0,0,.4);
                  position: relative;
                }
                .heading-section .subheading::after{
                  position: absolute;
                  left: 0;
                  right: 0;
                  bottom: -10px;
                  content: '';
                  width: 100%;
                  height: 2px;
                  background: #f5564e;
                  margin: 0 auto;
                }
          
                .heading-section-white{
                  color: rgba(255,255,255,.8);
                }
                .heading-section-white h2{
                  font-family:
                  line-height: 1;
                  padding-bottom: 0;
                }
          
                .heading-section-white h2{
                  color: #ffffff;
                }
                .heading-section-white .subheading{
                  margin-bottom: 0;
                  display: inline-block;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  color: rgba(255,255,255,.4);
                }
          
          
                .icon{
                  text-align: center;
                }
                .icon img{
                }
          
                @media screen and (max-width: 500px) {
          
                  .icon{
                    text-align: left;
                  }
          
                  .text-services{
                    padding-left: 0;
                    padding-right: 20px;
                    text-align: left;
                  }
          
                }
              </style>
            </head>
            <body width="100%" style="margin: 0 auto !important;padding: 0 !important;mso-line-height-rule: exactly;background-color: #222222;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background: #f1f1f1;font-family: 'Nunito Sans', sans-serif;font-weight: 400;font-size: 15px;line-height: 1.8;color: rgba(0,0,0,.4);height: 100% !important;width: 100% !important;">
              <center style="width: 100%;background-color: #f1f1f1;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                <div style="display: none;font-size: 1px;max-height: 0px;max-width: 0px;opacity: 0;overflow: hidden;mso-hide: all;font-family: sans-serif;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
                </div>
                <div style="max-width: 600px;margin: 0 auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="email-container">
                  <!-- BEGIN BODY -->
                  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;">
                    <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <td valign="top" style="padding: 1em 2.5em;background-color: #6f8c5f;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
                          <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <td width="40%" class="logo" style="text-align: left;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                              <h1 style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;font-family: 'Nunito Sans', sans-serif;color: #000000;margin-top: 0;">
                                <img src="https://res.cloudinary.com/dabgwgfzh/image/upload/v1609657863/BirdsOfNewZealand/emailWebsiteLogo/logofull_tecjeq.png" alt="Birds of New Zealand logo" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;-ms-interpolation-mode: bicubic;">
                              </h1>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- end tr -->
                    <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <td valign="middle" class="hero bg_white" style="background-image: url(https://source.unsplash.com/collection/36390090/1600x900);background-size: cover;height: 400px;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;position: relative;z-index: 0;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                        <div class="overlay" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;position: absolute;top: 0;left: 0;right: 0;bottom: 0;content: '';width: 100%;background: #000000;z-index: -1;opacity: .3;"></div>
                        <table style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
                          <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <td style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                              <div class="text" style="text-align: center;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: rgba(255,255,255,.8);padding: 0 4em;">
                                <h2 style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;font-family: 'Nunito Sans', sans-serif;color: #ffffff;margin-top: 0;font-size: 40px;margin-bottom: 0;line-height: 1.2;font-weight: 900;">Your password has been changed!</h2>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- end tr -->
                    <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <td class="email-section" style="background-color: #d4d0cb;text-align: center;font-family: 'Andika New Basic', sans-serif;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;padding: 2.5em;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                        <div class="heading-section heading-section-white" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: rgba(255,255,255,.8);">
                          <p style="color: black;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            This is a confirmation that the password for your account
                            ${user.username} has just been changed.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <!-- end: tr -->
                  </table>
                </div>
              </center>
            </body>
          </html>
          
          `,
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
});
// Testing code (ends)

router.get("/logout", users.logout);

module.exports = router;
