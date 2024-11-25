import express from "express";
import { createReadyCamera, getReadyCameraHistory } from "../controllers/readycamera.controller.js";

const router = express.Router();

router.post("/create", createReadyCamera);
router.get("/history", getReadyCameraHistory);

export default router;
