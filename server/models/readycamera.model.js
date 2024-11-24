import mongoose from 'mongoose';

// ReadyCamera schema definition
const readyCameraSchema = new mongoose.Schema(
    {
      category: {
        type: mongoose.Schema.ObjectId,
        ref: 'category', // Ensure this matches the 'category' model name
        required: true,
      },
      boxes: [
        {
          boxNo: {
            type: String,
            required: true,
            trim: true,
          },
          partsQty: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
          },
        },
      ],
      description: {
        type: String,
        default: '',
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  const ReadyCameraModel = mongoose.model('readycamera', readyCameraSchema);
  
  export default ReadyCameraModel;
  