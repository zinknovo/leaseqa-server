import express from "express";
import * as postsDao from "./dao.js";
import * as answersDao from "../Answers/dao.js";
import * as discussionsDao from "../Discussions/dao.js";
import { requireUser, requireRole } from "../utils/session.js";
import { sendData, sendError, sendNotFound } from "../utils/responses.js";

const router = express.Router();

router.get("/", (req, res) => {
  const filters = {
    folder: req.query.folder,
    search: req.query.search,
    role: req.query.role,
    viewerRole: req.session.currentUser?.role,
  };
  const data = postsDao.listPosts(filters).map((post) => ({
    ...post,
    answers: answersDao.findAnswersByPostId(post._id),
    discussions: discussionsDao.findDiscussionTreeForPost(post._id),
  }));
  sendData(res, data);
});

router.get("/:postId", (req, res) => {
  const post = postsDao.findPostById(req.params.postId);
  if (!post) {
    return sendNotFound(res, "Post not found");
  }
  sendData(res, {
    ...post,
    answers: answersDao.findAnswersByPostId(post._id),
    discussions: discussionsDao.findDiscussionTreeForPost(post._id),
  });
});

router.post("/", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const { summary, details, folders } = req.body;
  if (!summary || !details || !Array.isArray(folders) || folders.length === 0) {
    return sendError(res, {
      code: "VALIDATION_ERROR",
      message: "Summary, details, and at least one folder are required.",
      status: 400,
    });
  }
  const post = postsDao.createPost({
    ...req.body,
    authorId: currentUser._id,
  });
  sendData(res, post, 201);
});

router.put("/:postId", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const post = postsDao.findPostById(req.params.postId);
  if (!post) {
    return sendNotFound(res, "Post not found");
  }
  if (post.authorId !== currentUser._id && currentUser.role !== "admin") {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the author or admin can edit this post.",
      status: 403,
    });
  }
  const updated = postsDao.updatePost(req.params.postId, req.body);
  sendData(res, updated);
});

router.delete("/:postId", (req, res) => {
  const currentUser = requireRole(req, res, ["admin"]);
  if (!currentUser) {
    return;
  }
  const status = postsDao.removePost(req.params.postId);
  sendData(res, status);
});

export default router;
