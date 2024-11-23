import mongoose from 'mongoose';
import DamageProduct from '../models/damageproduct.model.js';
import ProductModel from "../models/product.model.js";

// Handle Damage Product (Add or Out)
export const handleDamageProduct = async (req, res) => {
  try {
    const { category, subCategory, boxes, action } = req.body; // Updated to accept multiple boxes

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(subCategory)) {
      return res.status(400).json({ success: false, message: 'Invalid Category or SubCategory IDs' });
    }

    // Iterate through each box for processing
    for (const box of boxes) {
      const { boxNo, partsQty } = box;

      // Find product associated with category and subcategory
      const selectedProduct = await ProductModel.findOne({
        category: { $in: category },
        subCategory: { $in: subCategory },
        "boxes.boxNo": boxNo, // Match by boxNo for manual entries
      });

      // If product or box is not found
      if (!selectedProduct) {
        return res.status(404).json({ success: false, message: `Product or Box (${boxNo}) not found.` });
      }

      const boxToUpdate = selectedProduct.boxes.find((b) => b.boxNo === boxNo);

      if (!boxToUpdate) {
        return res.status(404).json({ success: false, message: `Box (${boxNo}) not found in product.` });
      }

      // Validate parts quantity for "Out" action
      if (action === 'Out' && boxToUpdate.partsQty < partsQty) {
        return res.status(400).json({ success: false, message: `Insufficient quantity in Box (${boxNo}).` });
      }

      // Update the box quantity
      if (action === 'Add') {
        boxToUpdate.partsQty += partsQty;
      } else if (action === 'Out') {
        boxToUpdate.partsQty -= partsQty;
      }

      // Remove the box if partsQty reaches 0
      if (boxToUpdate.partsQty === 0) {
        selectedProduct.boxes = selectedProduct.boxes.filter((b) => b.boxNo !== boxNo);
      }

      // Save updated product
      await selectedProduct.save();

      // Save the damage product entry
      const damageProduct = new DamageProduct({
        category,
        subCategory,
        boxNo,
        quantity: partsQty,
        action,
      });

      await damageProduct.save();
    }

    res.status(200).json({ success: true, message: `Damaged Product(s) ${action} successfully!` });
  } catch (error) {
    console.error("Error handling damaged product:", error);
    res.status(500).json({ success: false, message: 'Failed to handle Damaged Product', error });
  }
};

// Get Damage Products
export const getDamageProducts = async (req, res) => {
  try {
    const damageProducts = await DamageProduct.find()
      .populate('category', 'name')
      .populate('subCategory', 'name');

    res.status(200).json({ success: true, data: damageProducts });
  } catch (error) {
    console.error("Error fetching damaged products:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch Damaged Products', error });
  }
};
