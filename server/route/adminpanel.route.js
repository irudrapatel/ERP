import express from 'express';
import { getPartsSummary } from '../controllers/adminpanel.controller.js';

const router = express.Router();

// Parts summary route
router.get('/parts-summary', getPartsSummary);

export default router;
