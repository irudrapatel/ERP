import ReadyCameraModel from "../models/readycamera.model.js";

export const createReadyCamera = async (req, res) => {
  try {
    const { category, boxes, description } = req.body;

    if (!category || !Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({
        message: "Category and at least one box are required.",
        success: false,
      });
    }

    // Validate each box
    for (const box of boxes) {
      if (!box.boxNo || !Array.isArray(box.partUIDs) || box.partUIDs.length === 0) {
        return res.status(400).json({
          message: "Each box must have a boxNo and at least one partUID.",
          success: false,
        });
      }
    }

    // Save the ready camera details
    const readyCamera = new ReadyCameraModel({
      category,
      boxes,
      description,
    });
    await readyCamera.save();

    res.status(201).json({
      message: "Ready camera added successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in createReadyCamera:", error.message);
    res.status(500).json({
      message: "Failed to add ready camera.",
      success: false,
      error: true,
    });
  }
};


export const getReadyCameraHistory = async (req, res) => {
  try {
    const history = await ReadyCameraModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          category: "$categoryDetails.name",
          boxes: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Ready camera history fetched successfully.",
      data: history,
      success: true,
    });
  } catch (error) {
    console.error("Error in getReadyCameraHistory:", error.message);
    res.status(500).json({
      message: "Failed to fetch ready camera history.",
      success: false,
      error: true,
    });
  }
};


export const getReadyCameraBoxes = async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required.",
        success: false,
      });
    }

    const boxes = await ReadyCameraModel.find({ category: categoryId })
      .select("boxes")
      .lean();

    const flattenedBoxes = boxes.flatMap((item) => item.boxes);

    res.status(200).json({
      message: "Ready camera boxes fetched successfully.",
      data: flattenedBoxes,
      success: true,
    });
  } catch (error) {
    console.error("Error in getReadyCameraBoxes:", error.message);
    res.status(500).json({
      message: "Failed to fetch ready camera boxes.",
      success: false,
      error: true,
    });
  }
};