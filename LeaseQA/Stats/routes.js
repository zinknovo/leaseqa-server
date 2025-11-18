import express from "express";
import * as statsDao from "./dao.js";
import { requireRole } from "../utils/session.js";
import { sendData } from "../utils/responses.js";

const router = express.Router();

router.get("/overview", (req, res) => {
  const currentUser = requireRole(req, res, ["admin"]);
  if (!currentUser) {
    return;
  }
  sendData(res, statsDao.overview());
});

export default router;
