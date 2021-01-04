const locations = require("../data/NZTowns");
const birdData = require("../data/NZBirds");
const Bird = require("../models/bird");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { response } = require("express");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const birds = await Bird.find({}).populate("popupText");
  res.render("birds/index", { birds });
};

module.exports.renderNewForm = (req, res) => {
  const locationArray = locations;
  const birdDataArray = birdData;
  res.render("birds/new", { locations, birdData });
};

module.exports.createPost = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.bird.location,
      limit: 1,
    })
    .send();
  const bird = new Bird(req.body.bird);
  bird.species = req.body.bird.species;
  bird.geometry = geoData.body.features[0].geometry;
  bird.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  bird.author = req.user._id;
  await bird.save();
  console.log(bird);
  req.flash("success", "Successfully made a new post!");
  res.redirect(`birds/${bird._id}`);
};

module.exports.showPost = async (req, res) => {
  const bird = await Bird.findById(req.params.id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!bird) {
    req.flash("error", "Cannot find that post");
    return res.redirect("/birds");
  }
  res.render("birds/show", { bird });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const birdDataArray = birdData;
  const locationArray = locations;
  const bird = await Bird.findById(id);
  if (!bird) {
    req.flash("error", "Cannot find that post!");
    return res.redirect("/birds");
  }
  res.render("birds/edit", { bird, locations, birdData });
};

module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const bird = await Bird.findByIdAndUpdate(id, { ...req.body.bird });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  const location = req.body.bird.location;
  const species = req.body.bird.species;
  bird.species = species;
  bird.location = location;
  bird.images.push(...imgs);
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.bird.location,
      limit: 1,
    })
    .send();
  bird.geometry = geoData.body.features[0].geometry;
  await bird.save();
  const formatDeleteRequest = req.body.deleteImages.map((s) => s.trim());
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await bird.updateOne({
      $pull: { images: { filename: { $in: formatDeleteRequest } } },
    });
  }
  req.flash("success", "Successfully updated a post");
  res.redirect(`/birds/${bird._id}`);
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  await Bird.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a post");
  res.redirect("/birds");
};
