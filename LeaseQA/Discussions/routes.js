import express from "express";
import * as discussionsDao from "./dao.js";
import * as postsDao from "../Posts/dao.js";
import { requireUser } from "../utils/session.js";
import { sendData, sendError, sendNotFound } from "../utils/responses.js";

const router = express.Router();

router.post("/", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const { postId, parentId, content } = req.body;
  if (!postId || !content) {
    return sendError(res, {
      code: "VALIDATION_ERROR",
      message: "postId and content are required.",
      status: 400,
    });
  }
  const post = postsDao.findPostById(postId);
  if (!post) {
    return sendNotFound(res, "Post not found");
  }
  const reply = discussionsDao.createDiscussion({
    postId,
    parentId,
    content,
    authorId: currentUser._id,
  });
  sendData(res, reply, 201);
});

router.patch("/:discussionId", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const discussion = discussionsDao.findDiscussionById(req.params.discussionId);
  if (!discussion) {
    return sendNotFound(res, "Discussion not found");
  }
  if (discussion.authorId !== currentUser._id && currentUser.role !== "admin") {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the author or admin can edit this discussion.",
      status: 403,
    });
  }
  const updated = discussionsDao.updateDiscussion(discussion._id, req.body);
  sendData(res, updated);
});

router.patch("/:discussionId/resolve", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const discussion = discussionsDao.findDiscussionById(req.params.discussionId);
  if (!discussion) {
    return sendNotFound(res, "Discussion not found");
  }
  const post = postsDao.findPostById(discussion.postId);
  if (
    post.authorId !== currentUser._id &&
    currentUser.role !== "admin" &&
    currentUser.role !== "lawyer"
  ) {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the post author, lawyers, or admins can toggle resolution.",
      status: 403,
    });
  }
  const updated = discussionsDao.updateDiscussion(discussion._id, {
    isResolved: req.body.isResolved === true,
  });
  sendData(res, updated);
});

router.delete("/:discussionId", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const discussion = discussionsDao.findDiscussionById(req.params.discussionId);
  if (!discussion) {
    return sendNotFound(res, "Discussion not found");
  }
  if (discussion.authorId !== currentUser._id && currentUser.role !== "admin") {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the author or admin can delete this discussion.",
      status: 403,
    });
  }
  const status = discussionsDao.deleteDiscussion(discussion._id);
  sendData(res, status);
});

export default router;
