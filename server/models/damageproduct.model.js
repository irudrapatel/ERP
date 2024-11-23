import mongoose from "mongoose";
import "../models/category.model.js"; // Ensure Category is registered
import "../models/subCategory.model.js"; // Ensure SubCategory is registered

const damageProductSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "subCategory", required: true },
    boxNo: { type: String, required: true },
    quantity: { type: Number, required: true },
    action: { type: String, enum: ["Add", "Out"], required: true },
  },
  { timestamps: true }
);

// Always check for existing model to avoid OverwriteModelError
const DamageProduct =
  mongoose.models.DamageProduct || mongoose.model("DamageProduct", damageProductSchema);

export default DamageProduct;
