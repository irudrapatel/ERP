import mongoose from "mongoose";

const excelUploadSchema = new mongoose.Schema(
    {
        partsName: { type: String, required: true },
        partsCode: { type: String, required: true },
        boxNo: { type: String, required: true },
        qty: { type: Number, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
        subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "subCategory", required: true },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
        remark: { type: String, default: "" },
    },
    { timestamps: true }
);

// Prevent OverwriteModelError
const ExcelUploadModel =
    mongoose.models.ExcelUpload || mongoose.model("ExcelUpload", excelUploadSchema);

export default ExcelUploadModel;
