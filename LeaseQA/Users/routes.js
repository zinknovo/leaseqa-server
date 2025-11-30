import express from "express";
import * as usersDao from "./dao.js";
import {requireRole, requireUser} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const current = requireRole(req, res, ["admin"]);
    if (!current) return;

    const users = await usersDao.findAllUsers();
    const sanitizedUsers = users.map(user => usersDao.sanitizeUser(user));
    sendData(res, sanitizedUsers);
});

router.get("/me", (req, res) => {
    const current = requireUser(req, res);
    if (!current) return;

    sendData(res, current);
});

router.get("/:userId", async (req, res) => {
    const current = requireRole(req, res, ["admin"]);
    if (!current) return;

    const user = await usersDao.findUserById(req.params.userId);
    if (!user) {
        return sendNotFound(res, "User not found");
    }

    sendData(res, usersDao.sanitizeUser(user));
});

router.patch("/me", async (req, res) => {
    const current = requireUser(req, res);
    if (!current) return;

    const updated = await usersDao.updateUser(current._id, req.body);
    req.session.currentUser = usersDao.sanitizeUser(updated);
    sendData(res, req.session.currentUser);
});

router.patch("/:userId/role", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const user = await usersDao.findUserById(req.params.userId);
    if (!user) {
        return sendNotFound(res, "User not found");
    }

    if (!["tenant", "lawyer", "admin"].includes(req.body.role)) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "Invalid role. Must be tenant, lawyer, or admin.",
            status: 400,
        });
    }

    const updated = await usersDao.updateUser(req.params.userId, {role: req.body.role});
    sendData(res, usersDao.sanitizeUser(updated));
});

router.patch("/:userId/verify-lawyer", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const user = await usersDao.findUserById(req.params.userId);
    if (!user) {
        return sendNotFound(res, "User not found");
    }

    if (user.role !== "lawyer") {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "User is not a lawyer.",
            status: 400,
        });
    }

    const updated = await usersDao.verifyLawyer(req.params.userId);
    sendData(res, usersDao.sanitizeUser(updated));
});

router.patch("/:userId/ban", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const user = await usersDao.findUserById(req.params.userId);
    if (!user) {
        return sendNotFound(res, "User not found");
    }

    const updated = req.body.banned === true
        ? await usersDao.banUser(req.params.userId)
        : await usersDao.unbanUser(req.params.userId);

    sendData(res, usersDao.sanitizeUser(updated));
});

router.delete("/:userId", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const user = await usersDao.findUserById(req.params.userId);
    if (!user) {
        return sendNotFound(res, "User not found");
    }

    await usersDao.deleteUser(req.params.userId);
    sendData(res, {message: "User deleted"});
});

export default router;