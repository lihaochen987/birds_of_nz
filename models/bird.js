const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const BirdSchema = new Schema({
  species: String,
  description: String,
  location: String,
  image: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

module.exports = mongoose.model("Bird", BirdSchema);

// Not 100% sure what this does, but it deletes our reviews lol
BirdSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});
