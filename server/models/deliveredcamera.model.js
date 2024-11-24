import mongoose from 'mongoose';

const outProductSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    box: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to a box ID in ProductModel
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('OutProduct', outProductSchema);
