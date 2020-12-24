const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Bird = require("./models/bird");

mongoose.connect("mongodb://localhost:27017/birds-of-nz", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.set('useFindAndModify', false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/birds", async (req, res) => {
  const birds = await Bird.find({});
  res.render("birds/index", { birds });
});

app.get("/birds/new", (req, res) => {
  res.render("birds/new");
});

app.post("/birds", async (req, res) => {
  const bird = new Bird(req.body.bird);
  await bird.save();
  res.redirect(`birds/${bird._id}`);
});

app.get("/birds/:id", async (req, res) => {
  const bird = await Bird.findById(req.params.id);
  res.render("birds/show", { bird });
});

app.get("/birds/:id/edit", async (req, res) => {
  const bird = await Bird.findById(req.params.id);
  res.render("birds/edit", { bird });
});

app.put("/birds/:id", async (req, res) => {
  const { id } = req.params;
  const bird = await Bird.findByIdAndUpdate(id, { ...req.body.bird });
  res.redirect(`${bird._id}`);
});

app.delete("/birds/:id", async (req, res) => {
  const { id } = req.params;
  await Bird.findByIdAndDelete(id);
  res.redirect("/birds");
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
