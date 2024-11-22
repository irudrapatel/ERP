import mongoose from 'mongoose';
import OutProduct from '../models/outproduct.model.js';

export const addOutProduct = async (req, res) => {
  try {
    const { category, subCategory, box, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(category) || 
        !mongoose.Types.ObjectId.isValid(subCategory) || 
        !mongoose.Types.ObjectId.isValid(box)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    const outProduct = new OutProduct({
      category,
      subCategory,
      box,
      quantity,
    });

    await outProduct.save();
    res.status(200).json({ success: true, message: 'Out Product added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add Out Product', error });
  }
};

export const getOutProducts = async (req, res) => {
  try {
    const outProducts = await OutProduct.find()
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('box', 'boxNo');

    res.status(200).json({ success: true, data: outProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Out Products', error });
  }
};
