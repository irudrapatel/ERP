import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Required field for category name
    description: { type: String, default: "" }, // Optional field for description
    image: { type: String, required: true }, // New field for image URL, marked as required
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Use existing model if already created; otherwise, create a new one
const CategoryModel =
  mongoose.models.category || mongoose.model("category", categorySchema);

export default CategoryModel;
