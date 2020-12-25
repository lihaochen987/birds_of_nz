const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Bird = require("./models/bird");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

mongoose.connect("mongodb://localhost:27017/birds-of-nz", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.set("useFindAndModify", false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateBird = (req, rest, next) => {
  const { error } = birdSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/birds",
  catchAsync(async (req, res) => {
    const birds = await Bird.find({});
    res.render("birds/index", { birds });
  })
);

app.get("/birds/new", (req, res) => {
  res.render("birds/new");
});

app.post(
  "/birds",
  catchAsync(async (req, res) => {
    if (!req.body.bird) throw new ExpressError("Invalid Post Data", 400);
    const bird = new Bird(req.body.bird);
    await bird.save();
    res.redirect(`birds/${bird._id}`);
  })
);

app.get(
  "/birds/:id",
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    res.render("birds/show", { bird });
  })
);

app.get(
  "/birds/:id/edit",
  catchAsync(async (req, res) => {
    const bird = await Bird.findById(req.params.id);
    res.render("birds/edit", { bird });
  })
);

app.put(
  "/birds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const bird = await Bird.findByIdAndUpdate(id, { ...req.body.bird });
    res.redirect(`${bird._id}`);
  })
);

app.delete(
  "/birds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Bird.findByIdAndDelete(id);
    res.redirect("/birds");
  })
);

// Read up more on error handling stuff
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
