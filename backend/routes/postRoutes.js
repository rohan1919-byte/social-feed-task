const express = require("express");

const router = express.Router();

const Post = require("../models/Post");
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


router.post(
  "/",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { text } = req.body;

      const user = await User.findById(
        req.user.id
      );

      const post = new Post({
        userId: user._id,
        username: user.username,
        text,
        image: req.file
          ? req.file.filename
          : "",
      });

      await post.save();

      res.status(201).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id/like", auth, async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const alreadyLiked = post.likes.find(
      (like) => like.userId === req.user.id
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) => like.userId !== req.user.id
      );
    } else {
      post.likes.push({
        userId: req.user.id,
        username: user.username,
      });
    }

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/:id/comment", auth, async (req, res) => {
  try {

    const { comment } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    post.comments.push({
      userId: req.user.id,
      username: user.username,
      comment,
    });

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;