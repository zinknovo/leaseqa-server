import express from "express";
import * as postsDao from "./dao.js";
import * as answersDao from "../Answers/dao.js";
import * as discussionsDao from "../Discussions/dao.js";
import {requireRole, requireUser} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const filters = {
        folder: req.query.folder,
        search: req.query.search,
        role: req.query.role,
        viewerRole: req.session?.currentUser?.role,
    };

    const posts = await postsDao.listPosts(filters);

    const data = await Promise.all(
        posts.map(async (post) => ({
            ...post.toObject(),
            answers: await answersDao.findAnswersByPostId(post._id),
            discussions: await discussionsDao.findDiscussionTreeForPost(post._id),
        }))
    );

    sendData(res, data);
});

router.get("/:postId", async (req, res) => {
    const post = await postsDao.findPostById(req.params.postId);
    if (!post) {
        return sendNotFound(res, "Post not found");
    }

    await postsDao.incrementViewCount(post._id);

    const answers = await answersDao.findAnswersByPostId(post._id);
    const discussions = await discussionsDao.findDiscussionTreeForPost(post._id);

    sendData(res, {
        ...post.toObject(),
        answers,
        discussions,
    });
});

router.post("/", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) return;

    const {summary, details, folders} = req.body;
    if (!summary || !details || !Array.isArray(folders) || folders.length === 0) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "Summary, details, and at least one folder are required.",
            status: 400,
        });
    }

    const post = await postsDao.createPost({
        ...req.body,
        authorId: currentUser._id,
    });
    sendData(res, post, 201);
});

router.put("/:postId", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) return;

    const post = await postsDao.findPostById(req.params.postId);
    if (!post) {
        return sendNotFound(res, "Post not found");
    }

    if (post.authorId.toString() !== currentUser._id.toString() && currentUser.role !== "admin") {
        return sendError(res, {
            code: "FORBIDDEN",
            message: "Only the author or admin can edit this post.",
            status: 403,
        });
    }

    const updated = await postsDao.updatePost(req.params.postId, req.body);
    sendData(res, updated);
});

router.delete("/:postId", async (req, res) => {
    const currentUser = requireRole(req, res, ["admin"]);
    if (!currentUser) return;

    const post = await postsDao.findPostById(req.params.postId);
    if (!post) {
        return sendNotFound(res, "Post not found");
    }

    await answersDao.deleteAnswersByPostId(post._id);
    await discussionsDao.deleteDiscussionsByPostId(post._id);
    await postsDao.deletePost(post._id);

    sendData(res, {message: "Post deleted"});
});

export default router;