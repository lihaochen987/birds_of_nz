const { birdSchema, commentSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Bird = require("./models/bird");
const Comment = require("./models/comment");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validatePost = (req, res, next) => {
  const { error } = birdSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const bird = await Bird.findById(id);
  if (!bird.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/birds/${id}`);
  }
  next();
};

module.exports.isCommentAuthor = async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/birds/${id}`);
  }
  next();
};

module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.hasUpvotedPost = async (req, res, next) => {
  const { id } = req.params;
  const bird = await Bird.findById(id);
  if (bird.likedBy.includes(req.user._id)) {
    req.flash("error", "You have already liked this post!");
    return res.redirect(`/birds/${id}`);
  }
  next();
};

module.exports.hasUpvotedComment = async (req, res, next) => {
  const { commentId, id } = req.params;
  const comment = await Comment.findById(commentId);
  if (comment.likedBy.includes(req.user._id)) {
    req.flash("error", "You have already like this comment!");
    return res.redirect(`/birds/${id}`);
  }
  next();
};
