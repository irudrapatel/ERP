import express from 'express';
import { addOutProduct, getOutProducts } from '../controllers/outproduct.controller.js';

const router = express.Router();

router.post('/add', addOutProduct);
router.get('/all', getOutProducts);

export default router;
