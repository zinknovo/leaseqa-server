import express from "express";
import multer from "multer";
import * as aiDao from "./dao.js";
import {analyzeContractText} from "./analyzer.js";
import {requireUser} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";

const router = express.Router();
const upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 8 * 1024 * 1024}});

router.get("/", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) {
        return;
    }
    const reviews = await aiDao.listReviewsForUser(currentUser._id);
    sendData(res, reviews);
});

router.get("/:reviewId", async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) {
        return;
    }
    const review = await aiDao.findReviewById(req.params.reviewId);
    if (!review || review.userId.toString() !== currentUser._id.toString()) {
        return sendNotFound(res, "Review not found");
    }
    sendData(res, review);
});

router.post("/", upload.single("file"), async (req, res) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) {
        return;
    }
    const {contractText, contractType, relatedPostId} = req.body;
    let textContent = contractText;
    if (!textContent && req.file) {
        textContent = req.file.buffer.toString("utf-8");
    }
    if (!textContent) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "Provide contractText or upload a file.",
            status: 400,
        });
    }
    const aiResponse = analyzeContractText(textContent);
    const review = await aiDao.createReview({
        userId: currentUser._id,
        contractType,
        relatedPostId,
        contractText: textContent,
        aiResponse,
    });
    sendData(res, review, 201);
});

export default router;