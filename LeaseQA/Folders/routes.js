import express from "express";
import * as foldersDao from "./dao.js";
import { requireRole } from "../utils/session.js";
import { sendData, sendError, sendNotFound } from "../utils/responses.js";

const router = express.Router();

router.get("/", (_req, res) => {
  sendData(res, foldersDao.listFolders());
});

router.post("/", (req, res) => {
  const admin = requireRole(req, res, ["admin"]);
  if (!admin) {
    return;
  }
  const { name, displayName } = req.body;
  if (!name || !displayName) {
    return sendError(res, {
      code: "VALIDATION_ERROR",
      message: "name and displayName are required.",
      status: 400,
    });
  }
  const folder = foldersDao.createFolder(req.body);
  sendData(res, folder, 201);
});

router.put("/:folderId", (req, res) => {
  const admin = requireRole(req, res, ["admin"]);
  if (!admin) {
    return;
  }
  const folder = foldersDao.updateFolder(req.params.folderId, req.body);
  if (!folder) {
    return sendNotFound(res, "Folder not found");
  }
  sendData(res, folder);
});

router.delete("/:folderId", (req, res) => {
  const admin = requireRole(req, res, ["admin"]);
  if (!admin) {
    return;
  }
  const status = foldersDao.deleteFolder(req.params.folderId);
  sendData(res, status);
});

export default router;
