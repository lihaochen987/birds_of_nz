const Bird = require("../models/bird");
const Comment = require("../models/comment");

module.exports.createComment = async (req, res) => {
  const bird = await Bird.findById(req.params.id);
  const comment = new Comment(req.body.comment);
  comment.author = req.user._id;
  bird.comments.push(comment);
  await comment.save();
  await bird.save();
  req.flash("success", "Created new comment!");
  res.redirect(`/birds/${bird._id}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  await Bird.findByIdAndUpdate(id, { $pull: { comments: commentId } });
  await Comment.findByIdAndDelete(commentId);
  req.flash("success", "Successfully deleted a comment!");
  res.redirect(`/birds/${id}`);
};
