import { Router } from 'express';
import auth from '../middleware/auth.js';
import { admin } from '../middleware/Admin.js';
import multer from 'multer';
import {
    createProductController,
    deleteProductDetails,
    getProductByCategory,
    getProductByCategoryAndSubCategory,
    getProductController,
    getProductDetails,
    searchProduct,
    updateProductDetails,
    uploadExcel,
    getUploadDetails, // Import the function
    updateUploadStatus, // Import the function
  } from "../controllers/product.controller.js"; // Ensure the path to the controller is correct

const productRouter = Router();

const upload = multer();

// Route for uploading Excel files
productRouter.post(
  '/upload-excel',
  auth,
  admin,
  upload.single('excelFile'), // Multer middleware to handle file upload
  uploadExcel // Controller function
);

productRouter.post('/create', auth, admin, createProductController);
productRouter.post('/get', getProductController);
productRouter.post('/get-product-by-category', getProductByCategory);
productRouter.post(
  '/get-pruduct-by-category-and-subcategory',
  getProductByCategoryAndSubCategory
);
productRouter.post('/get-product-details', getProductDetails);

// Update product
productRouter.put('/update-product-details', auth, admin, updateProductDetails);

// Delete product
productRouter.delete('/delete-product', auth, admin, deleteProductDetails);

// Search product
productRouter.post('/search-product', searchProduct);

productRouter.get("/get-upload-details", auth, admin, getUploadDetails); // Define the GET route
productRouter.post("/update-upload-status", auth, admin, updateUploadStatus); // Define the POST route

export default productRouter;
