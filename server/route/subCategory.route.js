import { Router } from "express";
import auth from "../middleware/auth.js";
import { 
    AddSubCategoryController, 
    deleteSubCategoryController, 
    getSubCategoryController, 
    updateSubCategoryController 
} from "../controllers/subCategory.controller.js";

// Define the subCategoryRouter
const subCategoryRouter = Router();

// Create subcategory route - Make sure code is passed and validated
subCategoryRouter.post('/create', auth, AddSubCategoryController);

// Get subcategories route
subCategoryRouter.post('/get', getSubCategoryController);

// Update subcategory route - Ensure code is validated during update as well
subCategoryRouter.put('/update', auth, updateSubCategoryController);

// Delete subcategory route
subCategoryRouter.delete('/delete', auth, deleteSubCategoryController);

export default subCategoryRouter;
