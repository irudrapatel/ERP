import mongoose from "mongoose";

// Import the Category and SubCategory models to ensure they are registered
import "../models/category.model.js"; // Import the model to register it
import "../models/subCategory.model.js"; // Import SubCategory model

const damageProductSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
    boxNo: { type: String, required: true },
    quantity: { type: Number, required: true },
    action: { type: String, enum: ["Add", "Out"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("DamageProduct", damageProductSchema);
