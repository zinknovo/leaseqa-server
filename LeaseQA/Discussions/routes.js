import express from "express";
import * as discussionsDao from "./dao.js";
import * as postsDao from "../Posts/dao.js";
import {requireUser} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) return;

    const {postId, parentId, content} = req.body;
    if (!postId || !content) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "postId and content are required.",
            status: 400,
        });
    }

    const post = await postsDao.findPostById(postId);
    if (!post) {
        return sendNotFound(res, "Post not found");
    }

    if (parentId) {
        const parentDiscussion = await discussionsDao.findDiscussionById(parentId);
        if (!parentDiscussion) {
            return sendNotFound(res, "Parent discussion not found");
        }
    }

    const reply = await discussionsDao.createDiscussion({
        postId,
        parentId,
        content,
        authorId: currentUser._id,
    });
    sendData(res, reply, 201);
});

router.patch("/:discussionId", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) return;

    const discussion = await discussionsDao.findDiscussionById(req.params.discussionId);
    if (!discussion) {
        return sendNotFound(res, "Discussion not found");
    }

    if (discussion.authorId.toString() !== currentUser._id.toString() && currentUser.role !== "admin") {
        return sendError(res, {
            code: "FORBIDDEN",
            message: "Only the author or admin can edit this discussion.",
            status: 403,
        });
    }

    const updated = await discussionsDao.updateDiscussion(discussion._id, req.body);
    sendData(res, updated);
});

router.patch("/:discussionId/resolve", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) return;

    const discussion = await discussionsDao.findDiscussionById(req.params.discussionId);
    if (!discussion) {
        return sendNotFound(res, "Discussion not found");
    }

    const post = await postsDao.findPostById(discussion.postId);
    if (!post) {
        return sendNotFound(res, "Post not found");
    }

    if (
        post.authorId.toString() !== currentUser._id.toString() &&
        currentUser.role !== "admin" &&
        currentUser.role !== "lawyer"
    ) {
        return sendError(res, {
            code: "FORBIDDEN",
            message: "Only the post author, lawyers, or admins can toggle resolution.",
            status: 403,
        });
    }

    const updated = await discussionsDao.updateDiscussion(discussion._id, {
        isResolved: req.body.isResolved === true,
    });
    sendData(res, updated);
});

router.delete("/:discussionId", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) return;

    const discussion = await discussionsDao.findDiscussionById(req.params.discussionId);
    if (!discussion) {
        return sendNotFound(res, "Discussion not found");
    }

    if (discussion.authorId.toString() !== currentUser._id.toString() && currentUser.role !== "admin") {
        return sendError(res, {
            code: "FORBIDDEN",
            message: "Only the author or admin can delete this discussion.",
            status: 403,
        });
    }

    await discussionsDao.deleteReplies(discussion._id);
    await discussionsDao.deleteDiscussion(discussion._id);
    sendData(res, {message: "Discussion deleted"});
});

export default router;