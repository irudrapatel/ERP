import mongoose from 'mongoose';
import OutProduct from '../models/outproduct.model.js';
import ProductModel from "../models/product.model.js";

// Add Out Product
export const addOutProduct = async (req, res) => {
  try {
    const { category, subCategory, box, quantity } = req.body;

    console.log("Request Body:", req.body);

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(category) ||
      !mongoose.Types.ObjectId.isValid(subCategory) ||
      !mongoose.Types.ObjectId.isValid(box)
    ) {
      console.error("Invalid IDs:", { category, subCategory, box });
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    // Find the product containing the box
    const selectedProduct = await ProductModel.findOne({
      category: { $in: category },
      subCategory: { $in: subCategory },
      "boxes._id": box,
    });

    console.log("Selected Product:", selectedProduct);

    if (!selectedProduct) {
      console.error("Product/Box not found.");
      return res.status(404).json({ success: false, message: 'Product/Box not found.' });
    }

    // Find and update the box quantity
    const boxToUpdate = selectedProduct.boxes.find((b) => b._id.toString() === box);
    console.log("Box To Update:", boxToUpdate);

    if (!boxToUpdate || boxToUpdate.partsQty < quantity) {
      console.error("Insufficient quantity in the selected box.");
      return res.status(400).json({ success: false, message: 'Insufficient quantity in the selected box.' });
    }

    // Reduce box quantity
    boxToUpdate.partsQty -= quantity;

    // Remove the box if quantity becomes 0
    if (boxToUpdate.partsQty === 0) {
      selectedProduct.boxes = selectedProduct.boxes.filter((b) => b._id.toString() !== box);
    }

    console.log("Updated Boxes:", selectedProduct.boxes);

    // Save the updated product
    await selectedProduct.save();

    // Save the Out Product entry
    const outProduct = new OutProduct({
      category,
      subCategory,
      box,
      quantity,
    });

    await outProduct.save();

    res.status(200).json({ success: true, message: 'Out Product added successfully!' });
  } catch (error) {
    console.error("Error in addOutProduct:", error);
    res.status(500).json({ success: false, message: 'Failed to add Out Product', error });
  }
};

// Get Out Products
export const getOutProducts = async (req, res) => {
  try {
    // Fetch all out products and populate related fields
    const outProducts = await OutProduct.find()
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('box', 'boxNo');

    res.status(200).json({ success: true, data: outProducts });
  } catch (error) {
    console.error("Error fetching out products:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch Out Products', error });
  }
};
