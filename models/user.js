const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const AvatarSchema = new Schema({
  url: String,
  filename: String,
});

AvatarSchema.virtual("userAvatar").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  recentActivity: [],
  commentCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  avatar: AvatarSchema,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
