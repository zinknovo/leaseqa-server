import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";

import authRoutes from "./LeaseQA/Auth/routes.js";
import userRoutes from "./LeaseQA/Users/routes.js";
import aiReviewRoutes from "./LeaseQA/AIReviews/routes.js";
import postRoutes from "./LeaseQA/Posts/routes.js";
import answerRoutes from "./LeaseQA/Answers/routes.js";
import discussionRoutes from "./LeaseQA/Discussions/routes.js";
import folderRoutes from "./LeaseQA/Folders/routes.js";
import statsRoutes from "./LeaseQA/Stats/routes.js";
import moderationRoutes from "./LeaseQA/Moderation/routes.js";

const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
connectDB();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);
const sessionOptions = {
    secret: process.env.SESSION_SECRET || "leaseqa-secret",
    resave: false,
    saveUninitialized: false,
};

if (process.env.SERVER_ENV && process.env.SERVER_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true,
        domain: process.env.SERVER_URL,
    };
}

app.use(session(sessionOptions));

app.use(express.json());
app.get("/api/health", (_req, res) => {
    res.json({ok: true, timestamp: new Date().toISOString()});
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai-reviews", aiReviewRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/moderation", moderationRoutes);

const port = process.env.PORT || 4050;
app.listen(port, () => {
    console.log(`LeaseQA server listening on port ${port}`);
});