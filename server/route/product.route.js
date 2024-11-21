import { Router } from 'express';
import auth from '../middleware/auth.js';
import { admin } from '../middleware/Admin.js';
import {
    createProductController,
    deleteProductDetails,
    getProductByCategory,
    getProductByCategoryAndSubCategory,
    getProductController,
    getProductDetails,
    searchProduct,
    updateProductDetails,  // Ensure this matches the export
} from '../controllers/product.controller.js';






const productRouter = Router();

productRouter.post("/create", auth, admin, createProductController);
productRouter.post('/get', getProductController);
productRouter.post("/get-product-by-category", getProductByCategory);
productRouter.post('/get-pruduct-by-category-and-subcategory', getProductByCategoryAndSubCategory);
productRouter.post('/get-product-details', getProductDetails);

// Update product
productRouter.put('/update-product-details', auth, admin, updateProductDetails);

// Delete product
productRouter.delete('/delete-product', auth, admin, deleteProductDetails);

// Search product 
productRouter.post('/search-product', searchProduct);

export default productRouter;
