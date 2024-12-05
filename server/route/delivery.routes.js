import express from "express";
import { deliverCamera } from "../controllers/delivery.controller.js";

const router = express.Router();

router.post("/deliver", deliverCamera);

export default router;
