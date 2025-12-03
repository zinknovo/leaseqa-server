import express from "express";
import * as statsDao from "./dao.js";
import { sendData } from "../utils/responses.js";

const router = express.Router();

//TODO: change back to admin only
router.get("/overview", async (req, res) => {
    const stats = await statsDao.overview();
    sendData(res, stats);
});

export default router;