import mongoose from "mongoose";
import DamageProduct from "../models/damageproduct.model.js";
import ProductModel from "../models/product.model.js";

export const handleDamageProduct = async (req, res) => {
  try {
    const { category, subCategory, boxes, action } = req.body;

    console.log("Received request body:", req.body);

    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(subCategory)) {
      return res.status(400).json({ success: false, message: "Invalid Category or SubCategory IDs" });
    }

    if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({ success: false, message: "No valid boxes provided." });
    }

    for (const box of boxes) {
      const boxNo = box.boxNo;
      const partsQty = Number(box.partsQty); // Convert partsQty to a number

      if (!boxNo || isNaN(partsQty) || partsQty <= 0) {
        console.error("Invalid box data:", box);
        continue; // Skip invalid box data
      }

      console.log(`Processing box: BoxNo=${boxNo}, PartsQty=${partsQty}, Action=${action}`);

      const selectedProduct = await ProductModel.findOne({ category, subCategory });

      if (!selectedProduct) {
        console.error(`No product found for category=${category} and subCategory=${subCategory}`);
        continue;
      }

      if (!selectedProduct.boxes) selectedProduct.boxes = [];
      const existingBox = selectedProduct.boxes.find((b) => b.boxNo === boxNo);

      if (action === "Add") {
        if (existingBox) {
          existingBox.partsQty += partsQty;
        } else {
          selectedProduct.boxes.push({ boxNo, partsQty });
        }
      } else if (action === "Out") {
        if (existingBox && existingBox.partsQty >= partsQty) {
          existingBox.partsQty -= partsQty;
        } else {
          console.error("Insufficient parts in box or box not found.");
          continue;
        }
      }

      await selectedProduct.save();

      const damageProduct = new DamageProduct({ category, subCategory, boxNo, quantity: partsQty, action });
      await damageProduct.save();
    }

    res.status(200).json({ success: true, message: "Operation completed successfully." });
  } catch (error) {
    console.error("Error in handleDamageProduct:", error);
    res.status(500).json({ success: false, message: "Failed to process request", error });
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
