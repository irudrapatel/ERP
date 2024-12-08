import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
      category: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "category",
          required: true,
        },
      ],
      subCategory: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "subCategory",
          required: true,
        },
      ],
      boxes: [
        {
          boxNo: {
            type: String,
            required: true,
          },
          partsQty: {
            type: Number,
            required: true,
          },
        },
      ],
      description: {
        type: String,
        default: "",
      },
      more_details: {
        type: Object,
        default: {},
      },
      publish: {
        type: Boolean,
        default: true,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // Add reference to the User model
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  productSchema.index(
    {
      description: "text",
    },
    {
      weights: {
        description: 10,
      },
    }
  );

const ProductModel = mongoose.model('product', productSchema);

const excelUploadSchema = new mongoose.Schema({
    partsName: { type: String, required: true },
    partsCode: { type: String, required: true },
    boxNo: { type: String, required: true },
    qty: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "subCategory", required: true },
    status: { type: String, default: "Pending" },
    remark: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Added user reference
  }, { timestamps: true });
  
  const ExcelUploadModel = mongoose.model("ExcelUpload", excelUploadSchema);
  

export default ProductModel;
