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
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

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
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://code.jquery.com/jquery-3.5.1.min.js",
  "https://unpkg.com/aos@2.3.1/dist/aos.js",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css",
  "https://unpkg.com/aos@2.3.1/dist/aos.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://fonts.gstatic.com/s/andikanewbasic/v2/taiRGn9tCp-44eleq5Q-mszJivxSeKaeEVKD.woff2",
];

app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dabgwgfzh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
              "https://source.unsplash.com/collection/36390090/1600x900"
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

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
