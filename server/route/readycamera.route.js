import { Router } from 'express';
import auth from '../middleware/auth.js';
import { admin } from '../middleware/Admin.js';
import {
  createReadyCamera,
  getReadyCameraHistory,
} from '../controllers/readycamera.controller.js';

const readyCameraRouter = Router();

// Create Ready Camera
readyCameraRouter.post('/create', auth, admin, createReadyCamera);

// Get Ready Camera History
readyCameraRouter.get('/history', auth, getReadyCameraHistory);

export default readyCameraRouter;
