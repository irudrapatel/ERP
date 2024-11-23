import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// The name here should exactly match the `ref` in other schemas
const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
