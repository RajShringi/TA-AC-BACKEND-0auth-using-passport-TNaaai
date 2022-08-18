const express = require("express");
const Article = require("../models/Article");
const router = express.Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

router.use(auth.isUserLogged);

router.get("/:id/edit", async (req, res, next) => {
  const id = req.params.id;
  const comment = await Comment.findById(id);
  if (String(comment.author) === req.user.id) {
    res.render("commentEditForm", { comment });
  } else {
    res.redirect("/notAuthorized");
  }
});

router.post("/:id", async (req, res, next) => {
  const id = req.params.id;
  const c = await Comment.findById(id);
  if (String(c.author) === req.user.id) {
    const comment = await Comment.findByIdAndUpdate(id, req.body);
    res.redirect("/articles/" + comment.articleId);
  } else {
    res.redirect("/notAuthorized");
  }
});

router.get("/:id/delete", async (req, res) => {
  const id = req.params.id;
  const c = await Comment.findById(id);
  if (String(c.author) === req.user.id) {
    const comment = await Comment.findByIdAndDelete(id);
    const article = await Article.findByIdAndUpdate(comment.articleId, {
      $pull: { comments: comment.id },
    });
    res.redirect("/articles/" + article.id);
  } else {
    res.redirect("/notAuthorized");
  }
});

router.get("/:id/like", async (req, res, next) => {
  const id = req.params.id;
  const comment = await Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } });
  res.redirect("/articles/" + comment.articleId);
});

module.exports = router;
