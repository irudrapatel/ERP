import mongoose from "mongoose";
import DamageProduct from "../models/damageproduct.model.js";
import ProductModel from "../models/product.model.js";

// Handle Damage Product (Add New Boxes Only)
export const handleDamageProduct = async (req, res) => {
  try {
    const { category, subCategory, boxes } = req.body;

    console.log("Received Request Body:", req.body);

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(subCategory)) {
      console.error("Invalid Category or SubCategory IDs");
      return res.status(400).json({ success: false, message: "Invalid Category or SubCategory IDs" });
    }

    if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
      console.error("No valid boxes provided:", boxes);
      return res.status(400).json({ success: false, message: "No valid boxes provided." });
    }

    // Iterate through each box for processing
    for (const box of boxes) {
      const { boxNo, partsQty } = box;

      if (!boxNo || typeof partsQty !== "number") {
        console.error("Invalid box data:", box);
        continue; // Skip invalid box data
      }

      console.log(`Processing box: BoxNo=${boxNo}, PartsQty=${partsQty}`);

      // Find product associated with category and subcategory
      const selectedProduct = await ProductModel.findOne({
        category,
        subCategory,
      });

      if (!selectedProduct) {
        console.error(`Product not found for Category: ${category}, SubCategory: ${subCategory}`);
        continue; // Skip to the next box
      }

      console.log("Selected Product Found:", selectedProduct);

      if (!selectedProduct.boxes) {
        selectedProduct.boxes = []; // Initialize boxes array if missing
      }

      // Add the new box to the product
      selectedProduct.boxes.push({
        boxNo,
        partsQty,
      });

      console.log("Adding new box to product:", { boxNo, partsQty });

      // Save the updated product
      await selectedProduct.save();
      console.log("Product updated successfully.");

      // Save the new box as a damaged product entry
      const damageProduct = new DamageProduct({
        category,
        subCategory,
        boxNo,
        quantity: partsQty,
      });

      await damageProduct.save();
      console.log("Damaged Product saved successfully.");
    }

    res.status(200).json({ success: true, message: `New boxes added successfully!` });
  } catch (error) {
    console.error("Error handling damaged product:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Failed to add new boxes", error });
  }
};

// Get Damage Products
export const getDamageProducts = async (req, res) => {
  try {
    const damageProducts = await DamageProduct.find()
      .populate("category", "name")
      .populate("subCategory", "name");

    res.status(200).json({ success: true, data: damageProducts });
  } catch (error) {
    console.error("Error fetching damaged products:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch Damaged Products", error });
  }
};
