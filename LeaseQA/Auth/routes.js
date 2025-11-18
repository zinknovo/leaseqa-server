import express from "express";
import * as usersDao from "../Users/dao.js";
import { sendData, sendError } from "../utils/responses.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const setSessionUser = (req, user) => {
  req.session.currentUser = usersDao.sanitizeUser(user);
};

router.post("/register", (req, res) => {
  const { username, email, password, role, lawyerVerification } = req.body;
  if (!username || !email || !password) {
    return sendError(res, {
      code: "VALIDATION_ERROR",
      message: "Username, email, and password are required.",
      status: 400,
    });
  }
  if (usersDao.findUserByEmail(email)) {
    return sendError(res, {
      code: "USER_EXISTS",
      message: "A user with that email already exists.",
      status: 409,
    });
  }
  const user = usersDao.createUser({
    username,
    email,
    password,
    role,
    lawyerVerification,
  });
  setSessionUser(req, user);
  return sendData(res, req.session.currentUser, 201);
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, {
      code: "VALIDATION_ERROR",
      message: "Email and password are required.",
      status: 400,
    });
  }
  const user = usersDao.findUserByEmail(email);
  if (!user) {
    return sendError(res, { code: "INVALID_CREDENTIALS", message: "Invalid login.", status: 401 });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return sendError(res, { code: "INVALID_CREDENTIALS", message: "Invalid login.", status: 401 });
  }
  if (user.banned) {
    return sendError(res, {
      code: "FORBIDDEN",
      message: "This account has been disabled by an administrator.",
      status: 403,
    });
  }
  setSessionUser(req, user);
  return sendData(res, req.session.currentUser);
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    sendData(res, { success: true });
  });
});

router.get("/session", (req, res) => {
  if (!req.session.currentUser) {
    return sendError(res, { code: "UNAUTHORIZED", message: "Not signed in.", status: 401 });
  }
  return sendData(res, req.session.currentUser);
});

export default router;
