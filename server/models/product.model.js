import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    category: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'category',
            required: true,
        }
    ],
    subCategory: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'subCategory',
            required: true,
        }
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
        }
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
    }
}, {
    timestamps: true,
});

productSchema.index({
    description: 'text',
}, {
    weights: {
        description: 10,
    }
});

const ProductModel = mongoose.model('product', productSchema);

export default ProductModel;
