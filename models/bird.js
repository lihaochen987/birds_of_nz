const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

//Export this out later

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

ImageSchema.virtual("carouselImage").get(function () {
  return this.url.replace("/upload", "/upload/c_scale,h_450");
});

const opts = { toJSON: { virtuals: true } };

const BirdSchema = new Schema(
  {
    species: String,
    description: String,
    location: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
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
  },
  opts
);

BirdSchema.virtual("properties.popUpMarkup").get(function () {
  return `
<div class="card" style="width: 9rem;">
  <img class="card-img-top" src="${this.images[0].url}" alt="image of ${this.species}">
  <div class="card-body text-center">
  <strong><a href="/birds/${this._id}">${this.species}</a><strong>
  </div>
</div>
`;
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
