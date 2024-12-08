import mongoose from "mongoose";
import DamageProduct from "../models/damageproduct.model.js";
import ProductModel from "../models/product.model.js";

export const handleDamagesProduct = async (req, res) => {
  try {
    const { category, subCategory, boxes, action } = req.body;
    const userId = req.userId; // Extract user ID from the authenticated request

    console.log("Received request body:", req.body);

    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(subCategory)) {
      return res.status(400).json({ success: false, message: "Invalid Category or SubCategory IDs" });
    }

    if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({ success: false, message: "No valid boxes provided." });
    }

    for (const box of boxes) {
      const { boxNo, partsQty } = box;

      if (!boxNo || isNaN(partsQty) || partsQty <= 0) {
        console.error("Invalid box data:", box);
        continue; // Skip invalid box data
      }

      console.log(`Processing box: BoxNo=${boxNo}, PartsQty=${partsQty}, Action=${action}`);

      // Determine if it's a damaged box based on boxNo
      const isDamagedBox = boxNo.startsWith("D");

      if (!isDamagedBox) {
        // Process ProductModel updates only for non-damaged boxes
        const selectedProduct = await ProductModel.findOne({ category, subCategory });

        if (!selectedProduct) {
          console.error(`No product found for category=${category} and subCategory=${subCategory}`);
          continue; // Skip processing this box
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

        await selectedProduct.save(); // Save updates to ProductModel
      }

      // Check if a damage product with the same category, subCategory, and boxNo exists
      const existingDamageProduct = await DamageProduct.findOne({ category, subCategory, boxNo, action });

      if (existingDamageProduct) {
        // Update the existing damage product quantity (ensure it's treated as a number)
        existingDamageProduct.quantity = Number(existingDamageProduct.quantity) + Number(partsQty);
        existingDamageProduct.updatedBy = userId;
        await existingDamageProduct.save();
      } else {
        // Create a new damage product entry
        const newDamageProduct = new DamageProduct({
          category,
          subCategory,
          boxNo,
          quantity: partsQty,
          action,
          createdBy: userId,
          updatedBy: userId,
        });
        await newDamageProduct.save();
      }
    }

    res.status(200).json({ success: true, message: "Operation completed successfully." });
  } catch (error) {
    console.error("Error in handleDamagesProduct:", error);
    res.status(500).json({ success: false, message: "Failed to process request", error });
  }
};


export const getDamageProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const query = {};

    // Apply date range filter if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch damage products with pagination and populate category, subCategory, and user details
    const damageProducts = await DamageProduct.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email") // Populate createdBy user details
      .populate("updatedBy", "name email") // Populate updatedBy user details
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total records for pagination
    const totalCount = await DamageProduct.countDocuments(query);

    res.status(200).json({
      success: true,
      data: damageProducts,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error in getDamageProducts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch Damaged Products", error });
  }
};
