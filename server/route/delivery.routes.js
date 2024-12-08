import express from "express";
import auth from "../middleware/auth.js"; // Import auth middleware
import { deliverCamera, getDeliveryHistory } from "../controllers/delivery.controller.js";

const router = express.Router();

router.post("/deliver", auth, deliverCamera); // Protected route
router.get("/history", getDeliveryHistory); // Protected route

export default router;
