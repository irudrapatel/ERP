import { Router } from "express";
import auth from "../middleware/auth.js";
import { 
    AddCameraPartsController, 
    deleteCameraPartsController, 
    getCameraPartsController, 
    updateCameraPartsController 
} from "../controllers/CameraParts.controller.js";

// Define the CameraPartsRouter
const CameraPartsRouter = Router();

// Create CameraParts route - Make sure code is passed and validated
CameraPartsRouter.post('/create', auth, AddCameraPartsController);

// Get subcategories route
CameraPartsRouter.post('/get', getCameraPartsController);

// Update CameraParts route - Ensure code is validated during update as well
CameraPartsRouter.put('/update', auth, updateCameraPartsController);

// Delete CameraParts route
CameraPartsRouter.delete('/delete', auth, deleteCameraPartsController);

export default CameraPartsRouter;
