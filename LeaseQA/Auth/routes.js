import express from "express";
import * as usersDao from "../Users/dao.js";
import {sendData, sendError} from "../utils/responses.js";

const router = express.Router();

const setSessionUser = (req, user) => {
    try {
        console.log("[Auth] Setting session for user:", user._id);
        const sanitized = usersDao.sanitizeUser(user);
        console.log("[Auth] Sanitized user:", sanitized);
        req.session.currentUser = sanitized;
        console.log("[Auth] Session set successfully");
    } catch (error) {
        console.error("[Auth] Error setting session:", error);
        throw error;
    }
};

router.post("/register", async (req, res) => {
    const {username, email, password, role, lawyerVerification} = req.body;

    if (!username || !email || !password) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "Username, email, and password are required.",
            status: 400,
        });
    }

    const existingUser = await usersDao.findUserByEmail(email);
    if (existingUser) {
        return sendError(res, {
            code: "USER_EXISTS",
            message: "A user with that email already exists.",
            status: 409,
        });
    }

    const user = await usersDao.createUser({
        username,
        email,
        password,
        role,
        lawyerVerification,
    });

    setSessionUser(req, user);
    return sendData(res, req.session.currentUser, 201);
});

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        console.log(`[Auth] Login attempt for: ${email}`);

        if (!email || !password) {
            console.log("[Auth] Missing email or password");
            return sendError(res, {
                code: "VALIDATION_ERROR",
                message: "Email and password are required.",
                status: 400,
            });
        }

        const user = await usersDao.findUserByEmail(email);
        if (!user) {
            console.log("[Auth] User not found");
            return sendError(res, {
                code: "INVALID_CREDENTIALS",
                message: "Invalid login.",
                status: 401,
            });
        }

        const isValidPassword = usersDao.verifyPassword(password, user.hashedPassword);
        if (!isValidPassword) {
            console.log("[Auth] Invalid password");
            return sendError(res, {
                code: "INVALID_CREDENTIALS",
                message: "Invalid login.",
                status: 401,
            });
        }

        if (user.banned) {
            console.log("[Auth] User banned");
            return sendError(res, {
                code: "FORBIDDEN",
                message: "This account has been disabled by an administrator.",
                status: 403,
            });
        }

        const userObj = user.toObject ? user.toObject() : user;
        const {hashedPassword, ...safeUser} = userObj;

        req.session.currentUser = safeUser;

        console.log(`[Auth] Login successful. Session ID: ${req.sessionID}`);
        return sendData(res, safeUser);
    } catch (error) {
        console.error("[Auth] CRITICAL ERROR in login route:", error);
        return sendError(res, {
            code: "INTERNAL_ERROR",
            message: "An internal server error occurred during login.",
            status: 500
        });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        sendData(res, {success: true});
    });
});

router.get("/session", (req, res) => {
    console.log(`[Auth] Session check. SessionID: ${req.sessionID}`);
    console.log(`[Auth] Session Data:`, req.session);

    if (!req.session.currentUser) {
        console.log("[Auth] No currentUser in session.");
        return sendError(res, {
            code: "UNAUTHORIZED",
            message: "Not signed in.",
            status: 401,
        });
    }
    console.log(`[Auth] Session valid for user: ${req.session.currentUser.email}`);
    return sendData(res, req.session.currentUser);
});

export default router;