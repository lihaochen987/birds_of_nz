const Bird = require("../models/bird");

module.exports.index = async (req, res) => {
  const birds = await Bird.find({});
  res.render("birds/index", { birds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("birds/new");
};

module.exports.createPost = async (req, res) => {
  if (!req.body.bird) throw new ExpressError("Invalid Post Data", 400);
  const bird = new Bird(req.body.bird);
  await bird.save();
  req.flash("success", "Successfully made a new post!");
  res.redirect(`birds/${bird._id}`);
};

module.exports.showPost = async (req, res) => {
  const bird = await Bird.findById(req.params.id).populate("reviews");
  if (!bird) {
    req.flash("error", "Cannot find that post");
    return res.redirect("/birds");
  }
  res.render("birds/show", { bird });
};

module.exports.renderEditForm = async (req, res) => {
  const bird = await Bird.findById(req.params.id);
  if (!bird) {
    req.flash("error", "Cannot find that post!");
    return res.redirect("/birds");
  }
  res.render("birds/edit", { bird });
};

module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const bird = await Bird.findByIdAndUpdate(id, { ...req.body.bird });
  req.flash("success", "Successfully updated a post");
  res.redirect(`${bird._id}`);
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  await Bird.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a post");
  res.redirect("/birds");
};
