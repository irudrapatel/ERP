import express from "express";
import auth from "../middleware/auth.js"; // Import auth middleware
import { createReadyCamera, getReadyCameraHistory } from "../controllers/readycamera.controller.js";

const router = express.Router();

router.post("/create", auth, createReadyCamera); // Protected route
router.get("/history", getReadyCameraHistory); // Protected route

export default router;
