import express from "express";
import * as answersDao from "./dao.js";
import * as postsDao from "../Posts/dao.js";
import { requireUser, requireRole } from "../utils/session.js";
import { sendData, sendError, sendNotFound } from "../utils/responses.js";

const router = express.Router();

router.post("/", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const { postId, content, answerType } = req.body;
  if (!postId || !content || !answerType) {
    return sendError(res, {
      code: "VALIDATION_ERROR",
      message: "postId, content, and answerType are required.",
      status: 400,
    });
  }
  if (answerType === "lawyer_opinion" && currentUser.role !== "lawyer") {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only verified lawyers can publish lawyer opinions.",
      status: 403,
    });
  }
  const post = postsDao.findPostById(postId);
  if (!post) {
    return sendNotFound(res, "Post not found");
  }
  const answer = answersDao.createAnswer({
    postId,
    content,
    answerType,
    authorId: currentUser._id,
  });
  sendData(res, answer, 201);
});

router.put("/:answerId", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const answer = answersDao.findAnswerById(req.params.answerId);
  if (!answer) {
    return sendNotFound(res, "Answer not found");
  }
  if (answer.authorId !== currentUser._id && currentUser.role !== "admin") {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the author or admin can edit this answer.",
      status: 403,
    });
  }
  const updated = answersDao.updateAnswer(answer._id, req.body);
  sendData(res, updated);
});

router.delete("/:answerId", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const answer = answersDao.findAnswerById(req.params.answerId);
  if (!answer) {
    return sendNotFound(res, "Answer not found");
  }
  if (currentUser.role !== "admin" && answer.authorId !== currentUser._id) {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the author or admin can delete this answer.",
      status: 403,
    });
  }
  const status = answersDao.deleteAnswer(answer._id);
  sendData(res, status);
});

router.post("/:answerId/accept", (req, res) => {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const answer = answersDao.findAnswerById(req.params.answerId);
  if (!answer) {
    return sendNotFound(res, "Answer not found");
  }
  const post = postsDao.findPostById(answer.postId);
  if (post.authorId !== currentUser._id && currentUser.role !== "admin") {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "Only the post author or admin can mark an answer as accepted.",
      status: 403,
    });
  }
  const updatedAnswer = answersDao.updateAnswer(answer._id, { isAccepted: true });
  postsDao.updatePost(post._id, { isResolved: true });
  sendData(res, updatedAnswer);
});

export default router;
