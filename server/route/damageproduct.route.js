import express from 'express';
import { handleDamagesProduct, getDamageProducts } from '../controllers/damageproduct.controller.js';
import auth from '../middleware/auth.js'; // Import the auth middleware

const router = express.Router();

router.post('/add-or-out', auth, handleDamagesProduct); // Protect this route
router.get('/all', getDamageProducts); // Protect this route

export default router;
