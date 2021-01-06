const Bird = require("../models/bird");
const Comment = require("../models/comment");
const User = require("../models/user");

module.exports.createComment = async (req, res) => {
  const bird = await Bird.findById(req.params.id);
  const comment = new Comment(req.body.comment);
  const user = await User.findById(req.user._id);
  comment.author = req.user._id;
  bird.comments.push(comment);
  user.userComments.push(comment);
  await user.save();
  await comment.save();
  await bird.save();
  req.flash("success", "Created new comment!");
  res.redirect(`/birds/${bird._id}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const user = await User.findById(req.user._id);
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { userComments: commentId },
  });
  await Bird.findByIdAndUpdate(id, { $pull: { comments: commentId } });
  await Comment.findByIdAndDelete(commentId);
  req.flash("success", "Successfully deleted a comment!");
  res.redirect(`/birds/${id}`);
};
