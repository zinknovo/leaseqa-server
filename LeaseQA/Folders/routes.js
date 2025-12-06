import express from "express";
import * as foldersDao from "./dao.js";
import {requireRole} from "../utils/session.js";
import {sendData, sendError, sendNotFound} from "../utils/responses.js";
import PostsModel from "../Posts/model.js";

const DEFAULT_FOLDERS = [
    {name: "deposit", displayName: "Security Deposit", description: "Deposits, deductions, and refund timelines"},
    {name: "eviction", displayName: "Eviction / Notice", description: "Notices to quit, timelines, and defenses"},
    {name: "repairs", displayName: "Repairs & Habitability", description: "Heat, mold, and repair timelines"},
    {name: "utilities", displayName: "Utilities / Heat", description: "Heat, water, electricity responsibilities"},
    {name: "leasebreak", displayName: "Breaking a Lease", description: "Early termination and assignments"},
    {name: "sublease", displayName: "Sublease / Roommates", description: "Adding/replacing roommates and subletting"},
    {name: "fees", displayName: "Late Fees / Rent", description: "Rent timing, late fees, and payment plans"},
    {name: "harassment", displayName: "Landlord Harassment", description: "Retaliation, lockouts, and privacy"},
];

const router = express.Router();

router.get("/", async (_req, res) => {
    await foldersDao.ensureUncategorized();
    await foldersDao.ensureDefaults(DEFAULT_FOLDERS);
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
        {
            $pull: {folders: folder.name},
            $addToSet: {folders: fallback.name},
        }
    );

    await foldersDao.deleteFolder(req.params.folderId);
    sendData(res, {message: "Folder deleted", reassignedTo: fallback.name});
});

export default router;
