import express from "express";
import * as foldersDao from "./dao.js";
import {requireRole} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";

const router = express.Router();

router.get("/", async (_req, res) => {
    const folders = await foldersDao.listFolders();
    sendData(res, folders);
});

router.post("/", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const {name, displayName} = req.body;
    if (!name || !displayName) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "name and displayName are required.",
            status: 400,
        });
    }

    const existing = await foldersDao.findFolderByName(name);
    if (existing) {
        return sendError(res, {
            code: "VALIDATION_ERROR",
            message: "Folder name already exists.",
            status: 400,
        });
    }

    const folder = await foldersDao.createFolder(req.body);
    sendData(res, folder, 201);
});

router.put("/:folderId", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const folder = await foldersDao.findFolderById(req.params.folderId);
    if (!folder) {
        return sendNotFound(res, "Folder not found");
    }

    const updated = await foldersDao.updateFolder(req.params.folderId, req.body);
    sendData(res, updated);
});

router.delete("/:folderId", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const folder = await foldersDao.findFolderById(req.params.folderId);
    if (!folder) {
        return sendNotFound(res, "Folder not found");
    }

    await foldersDao.deleteFolder(req.params.folderId);
    sendData(res, {message: "Folder deleted"});
});

export default router;