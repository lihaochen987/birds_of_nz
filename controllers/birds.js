const locations = require("../data/NZTowns");
const birdData = require("../data/NZBirds");
const Bird = require("../models/bird");
const User = require("../models/user");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { response } = require("express");
const { cloudinary } = require("../cloudinary");
const axios = require("axios");

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
  const user = await User.findById(req.user._id);
  bird.species = req.body.bird.species;
  bird.geometry = geoData.body.features[0].geometry;

  if (req.files.length > 5) {
    req.flash("error", "Too many images, please upload less than five!");
    res.redirect(`/birds`);
  }

  const imageList = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  function getStatus(image, imageList) {
    return axios.get("https://api.sightengine.com/1.0/check-workflow.json", {
      params: {
        url: imageList[image].url,
        workflow: process.env.SIGHTENGINE_WORKFLOW,
        api_user: process.env.SIGHTENGINE_USER,
        api_secret: process.env.SIGHTENGINE_SECRET,
      },
    });
  }

  async function getStatusList(imageList) {
    tempList = [];
    for (image in imageList) {
      const status = await getStatus(image, imageList);
      tempList.push(status.data.summary.action);
    }
    return tempList;
  }

  const statusList = await getStatusList(imageList);
  console.log(statusList);

  if (statusList.indexOf("reject") > -1) {
    req.flash(
      "error",
      "Inappropriate image(s), please insert a more appropriate one / more appropriate ones!"
    );
    res.redirect(`/birds`);
  } else {
    bird.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    bird.author = req.user._id;
    bird.save();

    user.recentActivity.unshift([
      "Created a post!",
      bird._id,
      bird.species,
      bird.images[0].url,
      req.body.bird.description,
    ]);
    user.postCount += 1;
    user.save();

    req.flash("success", "Successfully made a new post!");
    res.redirect(`birds/${bird._id}`);
  }
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
  const user = await User.findById(req.user._id);
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
  if (req.body.deleteImages) {
    const formatDeleteRequest = req.body.deleteImages.map((s) => s.trim());
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await bird.updateOne({
      $pull: { images: { filename: { $in: formatDeleteRequest } } },
    });
  }

  user.recentActivity.unshift([
    "Edited a post!",
    bird._id,
    bird.species,
    bird.images[0].url,
    req.body.bird.description,
  ]);

  await user.save();

  req.flash("success", "Successfully updated a post");
  res.redirect(`/birds/${bird._id}`);
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  for (i = user.recentActivity.length - 1; i >= 0; i--) {
    if (user.recentActivity[i][1] == id) {
      user.recentActivity.splice(i, 1);
    }
  }

  await user.save();
  await Bird.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a post");
  res.redirect("/birds");
};
