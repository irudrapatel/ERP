import mongoose from "mongoose";
import DamageProduct from "../models/damageproduct.model.js";
import ProductModel from "../models/product.model.js";

export const handleDamageProduct = async (req, res) => {
  try {
    const { category, subCategory, boxes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(subCategory)) {
      return res.status(400).json({ success: false, message: "Invalid Category or SubCategory IDs" });
    }

    if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({ success: false, message: "No valid boxes provided." });
    }

    for (const box of boxes) {
      const { boxNo, partsQty } = box;

      if (!boxNo || typeof partsQty !== "number") {
        continue; // Skip invalid box data
      }

      const selectedProduct = await ProductModel.findOne({ category, subCategory });

      if (!selectedProduct) {
        continue; // Skip if product not found
      }

      if (!selectedProduct.boxes) selectedProduct.boxes = [];
      selectedProduct.boxes.push({ boxNo, partsQty });
      await selectedProduct.save();

      const damageProduct = new DamageProduct({ category, subCategory, boxNo, quantity: partsQty });
      await damageProduct.save();
    }

    res.status(200).json({ success: true, message: `New boxes added successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add new boxes", error });
  }
};

export const getDamageProducts = async (req, res) => {
  try {
    const damageProducts = await DamageProduct.find()
      .populate("category", "name")
      .populate("subCategory", "name");

    res.status(200).json({ success: true, data: damageProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch Damaged Products", error });
  }
};
