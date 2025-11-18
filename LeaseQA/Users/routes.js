import express from "express";
import * as usersDao from "./dao.js";
import { requireUser, requireRole } from "../utils/session.js";
import { sendData, sendError, sendNotFound } from "../utils/responses.js";

const router = express.Router();

router.get("/", (req, res) => {
  const current = requireRole(req, res, ["admin"]);
  if (!current) {
    return;
  }
  sendData(res, usersDao.findAllUsers().map(usersDao.sanitizeUser));
});

router.get("/me", (req, res) => {
  const current = requireUser(req, res);
  if (!current) {
    return;
  }
  sendData(res, current);
});

router.patch("/me", (req, res) => {
  const current = requireUser(req, res);
  if (!current) {
    return;
  }
  const next = usersDao.updateUser(current._id, { profile: { ...current.profile, ...req.body } });
  req.session.currentUser = usersDao.sanitizeUser(next);
  sendData(res, req.session.currentUser);
});

router.patch("/:userId/role", (req, res) => {
  const admin = requireRole(req, res, ["admin"]);
  if (!admin) {
    return;
  }
  const user = usersDao.updateUser(req.params.userId, { role: req.body.role });
  if (!user) {
    return sendNotFound(res, "User not found");
  }
  sendData(res, usersDao.sanitizeUser(user));
});

router.patch("/:userId/ban", (req, res) => {
  const admin = requireRole(req, res, ["admin"]);
  if (!admin) {
    return;
  }
  const user = usersDao.updateUser(req.params.userId, { banned: req.body.banned === true });
  if (!user) {
    return sendNotFound(res, "User not found");
  }
  sendData(res, usersDao.sanitizeUser(user));
});

export default router;
