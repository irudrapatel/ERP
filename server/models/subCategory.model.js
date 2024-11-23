import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    partsPerCamera: {
      type: Number,
      default: 1,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Ensure this matches the registered name
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema); // Ensure name is "SubCategory"
export default SubCategoryModel;
