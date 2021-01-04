if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { birdSchema, commentSchema } = require("./schemas.js");
const Bird = require("./models/bird");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Comment = require("./models/comment");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");

const userRoutes = require("./routes/users");
const birdRoutes = require("./routes/birds");
const commentRoutes = require("./routes/comments");
const upvotePostRoutes = require("./routes/upvotePost");
const upvoteCommentRoutes = require("./routes/upvoteComment");

mongoose.connect("mongodb://localhost:27017/birds-of-nz", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/birds", birdRoutes);
app.use("/birds/:id/comments", commentRoutes);
app.use("/", userRoutes);
app.use("/birds/:id", upvotePostRoutes);
app.use("/birds/:id/comments/:commentId", upvoteCommentRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// Read up more on error handling stuff
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
