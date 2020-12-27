const Bird = require("../models/bird");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const bird = await Bird.findById(req.params.id);
  const review = new Review(req.body.review);
  bird.reviews.push(review);
  await review.save();
  await bird.save();
  req.flash("success", "Created new review!");
  res.redirect(`/birds/${bird._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Bird.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/birds/${id}`);
};
