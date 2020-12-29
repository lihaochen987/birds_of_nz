const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;

const BirdSchema = new Schema({
  species: String,
  description: String,
  location: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Bird", BirdSchema);

// Not 100% sure what this does, but it deletes our comments lol
BirdSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comments,
      },
    });
  }
});
