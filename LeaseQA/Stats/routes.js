import express from "express";
import * as statsDao from "./dao.js";
import {requireRole} from "../utils/session.js";
import {sendData} from "../utils/responses.js";

const router = express.Router();

router.get("/overview", async (req, res) => {
    const currentUser = requireRole(req, res, ["admin"]);
    if (!currentUser) return;

    const stats = await statsDao.overview();
    sendData(res, stats);
});

export default router;