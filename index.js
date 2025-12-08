import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
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
import path from "path";
import {fileURLToPath} from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envClientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map(url => url.trim())
    .filter(Boolean);
const defaultClientOrigin = envClientUrls[0] || "http://localhost:3000";
const allowedOrigins = new Set([
    ...envClientUrls,
    "https://leaseqa-client-web.vercel.app", // hosted frontend
]);
const isLocalClient = [...allowedOrigins].every(url => url.includes("localhost") || url.includes("127.0.0.1"));
const isProdLikeEnv = process.env.SERVER_ENV && process.env.SERVER_ENV !== "development";

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
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.has(origin) || origin.endsWith(".vercel.app")) {
                return callback(null, true);
            }
            return callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
    })
);
const useSecureCookies = isProdLikeEnv;
const sessionOptions = {
    secret: process.env.SESSION_SECRET || "leaseqa-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_CONNECTION_STRING,
        ttl: 24 * 60 * 60, // 24 hours
    }),
    cookie: {
        secure: useSecureCookies,
        sameSite: useSecureCookies ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
};

if (useSecureCookies) {
    // ensure secure cookies work correctly behind proxies/load balancers in prod/staging
    app.set("trust proxy", 1);
    sessionOptions.proxy = true;
}

app.use(session(sessionOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
