const express = require("express");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/new", auth.isUserLogged, (req, res) => {
  res.render("addArticleForm");
});

router.get("/", async (req, res, next) => {
  const articles = await Article.find({});
  if (articles === null) {
    return next(err);
  }
  res.status(200).render("articles", { articles });
});

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const article = await Article.findById(id);
  const articleWithAuthor = await article.populate("author");
  const articleWithAuthorAndComments = await article.populate("comments");
  if (!articleWithAuthor) {
    return next(err);
  }
  res
    .status(200)
    .render("articleDetail", { article: articleWithAuthorAndComments });
});

router.use(auth.isUserLogged);

router.post("/", async (req, res, next) => {
  req.body.author = req.user.id;
  const article = await Article.create(req.body);
  if (!article) {
    return next(err);
  }
  res.redirect("/articles");
});

router.get("/:id/edit", async (req, res, next) => {
  const id = req.params.id;
  const article = await Article.findById(id);
  if (!article) {
    return next(err);
  }
  if (String(article.author) === req.user.id) {
    res.status(200).render("editArticleForm", { article });
  } else {
    res.redirect("/notAuthorized");
  }
});

router.post("/:id", async (req, res, next) => {
  const id = req.params.id;
  const article = await Article.findById(id);
  if (String(article.author) === req.user.id) {
    const updatedArticle = await Article.findByIdAndUpdate(id, req.body);
    if (!updatedArticle) {
      return next(err);
    }
    return res.redirect("/articles/" + id);
  } else {
    return res.redirect("/notAuthorized");
  }
});

router.get("/:id/delete", async (req, res, next) => {
  const id = req.params.id;
  const article = await Article.findById(id);
  if (String(article.author) === req.user.id) {
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) {
      return next(err);
    }
    const comment = await Comment.deleteMany({ articleId: id });
    if (!comment) {
      return next(err);
    }
    res.redirect("/articles");
  } else {
    res.redirect("/notAuthorized");
  }
});

router.get("/:id/like", async (req, res, next) => {
  const id = req.params.id;
  const article = await Article.findByIdAndUpdate(id, { $inc: { likes: 1 } });
  if (!article) {
    return next(err);
  }
  res.redirect("/articles/" + article.id);
});

router.post("/:id/comments", async (req, res, next) => {
  const id = req.params.id;
  req.body.author = req.user.id;
  req.body.articleId = id;
  const comment = await Comment.create(req.body);
  if (!comment) {
    return next(err);
  }
  const article = await Article.findByIdAndUpdate(id, {
    $push: { comments: comment.id },
  });
  if (!article) {
    return next(err);
  }
  res.redirect("/articles/" + id);
});

module.exports = router;
