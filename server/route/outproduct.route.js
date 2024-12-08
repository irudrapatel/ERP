import express from 'express';
import { addOutProduct, getOutProducts } from '../controllers/outproduct.controller.js';
import auth from '../middleware/auth.js'; // Import the auth middleware

const router = express.Router();

router.post('/add', auth, addOutProduct); // Protect this route
router.get('/all', getOutProducts); // Protect this route

export default router;
