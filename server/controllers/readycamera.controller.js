import ReadyCameraModel from "../models/readycamera.model.js";

export const createReadyCamera = async (req, res) => {
  try {
    const { category, boxes, description } = req.body;
    const userId = req.userId; // Extract user ID from authenticated request

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

    // Save the ready camera details with user ID
    const readyCamera = new ReadyCameraModel({
      category,
      boxes,
      description,
      user: userId, // Associate the user with the ready camera
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
    // Fetch ready camera data
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
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Unwind user details to get the first matched user
      {
        $addFields: {
          totalParts: {
            $sum: {
              $map: {
                input: "$boxes",
                as: "box",
                in: { $size: "$$box.partUIDs" },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          category: "$categoryDetails.name",
          boxes: 1,
          totalParts: 1, // Include total parts for each record
          user: {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            email: "$userDetails.email",
          }, // Include user details as an object with _id, name, and email
        },
      },
    ]);

    // Calculate total parts by category
    const totalPartsByCategory = history.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.totalParts;
      return acc;
    }, {});

    res.status(200).json({
      message: "Ready camera history fetched successfully.",
      data: history,
      totalPartsByCategory, // Add the total parts count grouped by category
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

export const getReadyCameraStats = async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required.",
        success: false,
      });
    }

    // Fetch ready cameras for the category
    const readyCameras = await ReadyCameraModel.find({ category: categoryId }).lean();

    let totalParts = 0;
    let totalReadyCameras = 0;

    // Calculate total parts and ready cameras
    readyCameras.forEach((camera) => {
      camera.boxes.forEach((box) => {
        totalParts += box.partUIDs.length; // Assuming partUIDs represents the parts in a box
        totalReadyCameras += 1; // Increment ready camera count for each camera
      });
    });

    // Assume a logic for possible cameras
    const possibleCameras = Math.floor(totalParts / 5); // Example: Each camera needs 5 parts

    res.status(200).json({
      message: "Camera stats fetched successfully.",
      data: {
        totalParts,
        totalReadyCameras,
        possibleCameras,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in getReadyCameraStats:", error.message);
    res.status(500).json({
      message: "Failed to fetch camera stats.",
      success: false,
      error: true,
    });
  }
};