import express from "express";
import multer from "multer";
import * as aiDao from "./dao.js";
import { analyzeContractText } from "./analyzer.js";
import { sendData, sendError, sendNotFound } from "../utils/responses.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.get("/", async (req, res) => {
    const reviews = await aiDao.listAllReviews();
    sendData(res, reviews);
});

router.get("/:reviewId", async (req, res) => {
    const review = await aiDao.findReviewById(req.params.reviewId);
    if (!review) {
        return sendNotFound(res, "Review not found");
    }
    sendData(res, review);
});

router.post("/", upload.single("file"), async (req, res) => {
    const { contractText, contractType, relatedPostId } = req.body;

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
        userId: null,
        contractType,
        relatedPostId,
        contractText: textContent,
        aiResponse,
    });

    sendData(res, review, 201);
});

export default router;