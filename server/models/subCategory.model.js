import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "",
        },
        code: {
            type: String,
            required: true,
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
                type: mongoose.Schema.ObjectId,
                ref: "category",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const SubCategoryModel = mongoose.model("subCategory", subCategorySchema);

export default SubCategoryModel;
