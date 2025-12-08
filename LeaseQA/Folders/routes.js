import express from "express";
import * as foldersDao from "./dao.js";
import {requireRole} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";
import PostsModel from "../Posts/model.js";

const router = express.Router();

router.get("/", async (_req, res) => {
    await foldersDao.ensureUncategorized();
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

router.put("/:_id", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const folder = await foldersDao.findFolderById(req.params._id);
    if (!folder) {
        return sendNotFound(res, "Folder not found");
    }

    const updated = await foldersDao.updateFolder(req.params._id, req.body);
    sendData(res, updated);
});

router.delete("/:_id", async (req, res) => {
    const admin = requireRole(req, res, ["admin"]);
    if (!admin) return;

    const folder = await foldersDao.findFolderById(req.params._id);
    if (!folder) {
        return sendNotFound(res, "Folder not found");
    }

    if (folder.name === "uncategorized") {
        return sendError(res, {
            code: "FORBIDDEN",
            message: "Default section cannot be deleted.",
            status: 400,
        });
    }

    const fallback = await foldersDao.ensureUncategorized();

    await PostsModel.updateMany(
        {folders: folder.name},
        {$pull: {folders: folder.name}}
    );

    await PostsModel.updateMany(
        {folders: {$size: 0}},
        {$addToSet: {folders: fallback.name}}
    );

    await foldersDao.deleteFolder(req.params._id);
    sendData(res, {message: "Folder deleted", reassignedTo: fallback.name});
});

export default router;
