import express from 'express';
import { handleDamageProduct, getDamageProducts } from '../controllers/damageproduct.controller.js';

const router = express.Router();

router.post('/add-or-out', handleDamageProduct); // Add or Out action for Damage Products
router.get('/all', getDamageProducts); // Fetch all Damage Products

export default router;
