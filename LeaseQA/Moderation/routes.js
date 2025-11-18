import express from "express";
import * as postsDao from "../Posts/dao.js";
import { requireRole } from "../utils/session.js";
import { sendData, sendNotFound } from "../utils/responses.js";

const router = express.Router();

router.post("/posts/:postId/hide", (req, res) => {
  const admin = requireRole(req, res, ["admin"]);
  if (!admin) {
    return;
  }
  const post = postsDao.findPostById(req.params.postId);
  if (!post) {
    return sendNotFound(res, "Post not found");
  }
  const updated = postsDao.updatePost(post._id, { isHidden: req.body.isHidden !== false });
  sendData(res, updated);
});

export default router;
