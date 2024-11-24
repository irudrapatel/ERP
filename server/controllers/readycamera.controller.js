import ReadyCameraModel from '../models/readycamera.model.js';
import CategoryModel from '../models/category.model.js';

export const createReadyCamera = async (req, res) => {
    try {
      const { category, boxes, description } = req.body;
  
      if (!category || !boxes || !Array.isArray(boxes) || boxes.length === 0) {
        return res.status(400).json({
          message: 'Category and boxes are required.',
          error: true,
          success: false,
        });
      }
  
      for (const box of boxes) {
        if (!box.boxNo || !box.partsQty) {
          return res.status(400).json({
            message: 'Each box must include boxNo and partsQty.',
            error: true,
            success: false,
          });
        }
      }
  
      // Create a new ReadyCamera entry
      const readyCamera = new ReadyCameraModel({
        category,
        boxes,
        description,
      });
  
      // Save the entry
      const savedReadyCamera = await readyCamera.save();
  
      // Populate the category name and ID
      const populatedReadyCamera = await ReadyCameraModel.findById(savedReadyCamera._id).populate(
        'category',
        'name _id'
      );
  
      return res.status(200).json({
        message: 'Ready Camera added successfully.',
        data: populatedReadyCamera,
        success: true,
        error: false,
      });
    } catch (error) {
      console.error('Error in createReadyCamera:', error);
      return res.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  };

  export const getReadyCameraHistory = async (req, res) => {
    try {
      const history = await ReadyCameraModel.aggregate([
        {
          $lookup: {
            from: 'categories', // The name of the collection in the database
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        {
          $unwind: {
            path: '$categoryDetails', // Extract the first element of the array
            preserveNullAndEmptyArrays: true, // Keep entries even if no match
          },
        },
        {
          $project: {
            _id: 1,
            category: '$categoryDetails.name', // Use the category name from the joined document
            totalQty: { $sum: '$boxes.partsQty' }, // Sum of partsQty
            totalBoxes: { $size: '$boxes' }, // Count the number of boxes
            createdAt: 1,
          },
        },
      ]);
  
      return res.status(200).json({
        message: 'History fetched successfully.',
        data: history,
        success: true,
        error: false,
      });
    } catch (error) {
      console.error('Error in getReadyCameraHistory:', error);
      return res.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  };
