import ProductModel from "../models/product.model.js";
import ExcelUploadModel from "../models/excelUpload.model.js";
import ExcelJS from "exceljs";
import SummaryApi from "../config/apiConfig.js";
import mongoose from "mongoose";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";

// Upload Excel

import axios from "axios";

export const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const userId = req.userId; // Extract user ID from authenticated request

        // Fetch subcategories from external API
        const subCategoryResponse = await axios.post(`${SummaryApi.baseURL}${SummaryApi.getSubCategory.url}`);
        if (!subCategoryResponse.data.success) {
            return res.status(500).json({ success: false, message: "Failed to fetch subcategories" });
        }
        const subCategories = subCategoryResponse.data.data;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet(1);

        const rows = [];
        const categoryId = new mongoose.Types.ObjectId(req.body.category || "673f2c9ba9bb346e501ecb93"); // Default category

        worksheet.eachRow((row, index) => {
            if (index === 1) return; // Skip header row

            const partsName = row.getCell(2).text?.trim();
            const partsCode = row.getCell(1).text?.trim();
            const boxNo = row.getCell(3).text?.trim();
            const qty = parseInt(row.getCell(4).text?.trim(), 10) || 0;

            if (!partsName || !partsCode) {
                console.warn(`Skipping row: missing partsName or partsCode: ${partsName}, ${partsCode}`);
                return;
            }

            const matchedSubCategory = subCategories.find(
                (sub) => sub.name.toLowerCase() === partsName.toLowerCase()
            );

            if (!matchedSubCategory || !matchedSubCategory._id) {
                console.warn(`No match found for partsName: ${partsName}`);
                return;
            }

            rows.push({
                partsName,
                partsCode,
                boxNo,
                qty,
                category: categoryId,
                subCategory: new mongoose.Types.ObjectId(matchedSubCategory._id),
                status: "Pending",
                remark: "",
                user: userId, // Add user reference
            });
        });

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "No valid rows to save" });
        }

        const savedData = await ExcelUploadModel.insertMany(rows);
        res.json({
            success: true,
            message: "Excel uploaded and data saved successfully",
            data: savedData,
        });
    } catch (error) {
        console.error("Error in uploadExcel:", error.message);
        res.status(500).json({ success: false, message: "Error processing Excel file", error: error.message });
    }
};


// Fetch Upload Details
export const getUploadDetails = async (req, res) => {
    try {
        const data = await ExcelUploadModel.aggregate([
            { $match: { status: "Pending" } },
            {
                $lookup: {
                    from: "categories", // Collection name in MongoDB
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "subcategories", // Collection name in MongoDB
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory",
                },
            },
            {
                $addFields: {
                    isValid: { $cond: { if: { $ne: ["$subCategory", []] }, then: true, else: false } },
                },
            },
            {
                $project: {
                    partsCode: 1,
                    partsName: 1,
                    boxNo: 1,
                    qty: 1,
                    status: 1,
                    remark: 1,
                    "category.name": { $arrayElemAt: ["$category.name", 0] },
                    "subCategory.name": { $arrayElemAt: ["$subCategory.name", 0] },
                    "subCategory.code": { $arrayElemAt: ["$subCategory.code", 0] },
                    isValid: 1,
                },
            },
        ]);

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error in getUploadDetails:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Update Upload Status
export const updateUploadStatus = async (req, res) => {
    try {
        const { id, status, remark } = req.body;

        const update = { status };
        if (status === "Rejected") {
            update.remark = remark || "Rejected";
        }

        const updatedData = await ExcelUploadModel.findByIdAndUpdate(id, update, { new: true });

        if (!updatedData) {
            return res.status(404).json({ success: false, message: "Data not found for the provided ID" });
        }

        res.json({ success: true, message: "Status updated successfully", data: updatedData });
    } catch (error) {
        console.error("Error in updateUploadStatus:", error.message);
        res.status(500).json({ success: false, message: "Error updating status", error: error.message });
    }
};


export const createProductController = async (request, response) => {
    try {
        const {
            category,
            subCategory,
            boxes,
            description,
            more_details,
        } = request.body;

        const userId = request.userId; // Extract user ID from the authenticated request

        // Validate required fields
        if (!category || !subCategory || !boxes || !Array.isArray(boxes) || boxes.length === 0) {
            return response.status(400).json({
                message: "Enter required fields (category, subCategory, boxes with boxNo and partQty).",
                error: true,
                success: false,
            });
        }

        // Validate that each box has required fields
        for (const box of boxes) {
            if (!box.boxNo || !box.partsQty) {
                return response.status(400).json({
                    message: "Each box must include boxNo and partsQty.",
                    error: true,
                    success: false,
                });
            }
        }

        const product = new ProductModel({
            category,
            subCategory,
            boxes, // Save boxes as an array
            description,
            more_details,
            user: userId, // Add user reference
        });

        const saveProduct = await product.save();

        return response.json({
            message: "Product Created Successfully",
            data: saveProduct,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};



// Other controllers remain the same.

export const deleteProductDetails = async (request, response) => {
    try {
        const { _id } = request.body;

        if (!_id) {
            return response.status(400).json({
                message: "Provide _id",
                error: true,
                success: false,
            });
        }

        const deleteProduct = await ProductModel.deleteOne({ _id });

        return response.json({
            message: "Deleted successfully",
            error: false,
            success: true,
            data: deleteProduct,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const getProductByCategory = async (request, response) => {
    try {
        const { id } = request.body;

        if (!id) {
            return response.status(400).json({
                message: "Provide category id",
                error: true,
                success: false,
            });
        }

        const product = await ProductModel.find({
            category: { $in: id },
        }).limit(15);

        return response.json({
            message: "Category product list",
            data: product,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const getProductByCategoryAndSubCategory = async (request, response) => {
    try {
        const { categoryId, subCategoryId, page, limit } = request.body;

        if (!categoryId || !subCategoryId) {
            return response.status(400).json({
                message: "Provide categoryId and subCategoryId",
                error: true,
                success: false,
            });
        }

        const currentPage = page || 1;
        const pageLimit = limit || 10;
        const skip = (currentPage - 1) * pageLimit;

        const query = {
            category: { $in: categoryId },
            subCategory: { $in: subCategoryId },
        };

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),
            ProductModel.countDocuments(query),
        ]);

        return response.json({
            message: "Product list",
            data: data,
            totalCount: totalCount,
            page: currentPage,
            limit: pageLimit,
            success: true,
            error: false,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const getProductController = async (request, response) => {
    try {
        const { search } = request.body; // Remove page and limit for no pagination

        const query = search
            ? {
                  $text: {
                      $search: search,
                  },
              }
            : {};

        // Fetch all records without limit or skip
        const data = await ProductModel.find(query)
        .sort({ createdAt: -1 }) // Sort by creation date (latest first)
        .populate("category", "name") // Populate category name
        .populate("subCategory", "name code") // Populate subCategory name
        .populate("user", "name email"); // Populate user name and email
            

        return response.json({
            message: "Product data",
            error: false,
            success: true,
            totalCount: data.length, // Total number of records
            data: data, // All data
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};


export const getProductDetails = async (request, response) => {
    try {
        const { productId } = request.body;

        const product = await ProductModel.findOne({ _id: productId });

        return response.json({
            message: "Product details",
            data: product,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const searchProduct = async (request, response) => {
    try {
        let { search, page, limit } = request.body;

        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }

        const query = search
            ? {
                  $text: {
                      $search: search,
                  },
              }
            : {};

        const skip = (page - 1) * limit;

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('category subCategory'),
            ProductModel.countDocuments(query),
        ]);

        return response.json({
            message: "Product data",
            error: false,
            success: true,
            data: data,
            totalCount: dataCount,
            totalPage: Math.ceil(dataCount / limit),
            page: page,
            limit: limit,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const updateProductDetails = async (request, response) => {
    try {
        const { _id } = request.body;

        if (!_id) {
            return response.status(400).json({
                message: "provide product _id",
                error: true,
                success: false,
            });
        }

        const updateProduct = await ProductModel.updateOne({ _id: _id }, {
            ...request.body,
        });

        return response.json({
            message: "updated successfully",
            data: updateProduct,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};


export const getAllUploadData = async (req, res) => {
    try {
        // Fetch all Excel upload data
        const allData = await ExcelUploadModel.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory",
                },
            },
            {
                $project: {
                    partsCode: 1,
                    partsName: 1,
                    boxNo: 1,
                    qty: 1,
                    status: 1,
                    remark: 1,
                    "category._id": { $arrayElemAt: ["$category._id", 0] }, // Extract only `_id`
                    "subCategory._id": { $arrayElemAt: ["$subCategory._id", 0] }, // Extract only `_id`
                    "category.name": { $arrayElemAt: ["$category.name", 0] },
                    "subCategory.name": { $arrayElemAt: ["$subCategory.name", 0] },
                },
            },
        ]);

        // Ensure `allData` is returned in the response
        res.json({
            success: true,
            data: allData, // Use `allData` instead of undefined `data`
        });
    } catch (error) {
        console.error("Error in getAllUploadData:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching all upload data",
            error: error.message,
        });
    }
};


// Store processed IDs in memory (Note: This will reset on server restart)
const processedIds = new Set();

export const processAndPostUploadData = async (req, res) => {
    try {
        // Fetch approved data
        const approvedData = await ExcelUploadModel.aggregate([
            { $match: { status: "Approved" } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory",
                },
            },
            {
                $project: {
                    partsCode: 1,
                    partsName: 1,
                    boxNo: 1,
                    qty: 1,
                    status: 1,
                    remark: 1,
                    _id: 1,
                    "categoryId": { $arrayElemAt: ["$category._id", 0] },
                    "subCategoryId": { $arrayElemAt: ["$subCategory._id", 0] },
                    "categoryName": { $arrayElemAt: ["$category.name", 0] },
                    "subCategoryName": { $arrayElemAt: ["$subCategory.name", 0] },
                },
            },
        ]);

        // Check the product collection to filter out already created products
        const existingProducts = await ProductModel.find({}).select("category subCategory boxes.boxNo boxes.partsQty");

        const unprocessedData = approvedData.filter((item) => {
            return !existingProducts.some(
                (product) =>
                    product.category.includes(item.categoryId) &&
                    product.subCategory.includes(item.subCategoryId) &&
                    product.boxes.some((box) => box.boxNo === item.boxNo && box.partsQty === item.qty) // Added qty check
            );
        });

        if (!unprocessedData.length) {
            return res.json({ success: true, message: "No unprocessed data to push." });
        }

        // Format unprocessed data for product creation
        const formattedData = unprocessedData.map((item) => ({
            category: [item.categoryId],
            subCategory: [item.subCategoryId],
            boxes: [
                {
                    boxNo: item.boxNo,
                    partsQty: item.qty,
                },
            ],
            description: "",
            publish: true,
        }));

        // Post unprocessed data to createProduct API
        const postResults = [];
        for (const product of formattedData) {
            try {
                const response = await axios.post(
                    `${SummaryApi.baseURL}/api/product/create`,
                    product,
                    {
                        headers: {
                            Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`,
                        },
                    }
                );
                postResults.push({ success: true, data: response.data });
            } catch (error) {
                console.error("Error posting to createProduct:", error.message);
                postResults.push({ success: false, error: error.message });
            }
        }

        // Return response
        res.json({
            success: true,
            message: "Data processed and pushed successfully.",
            postResults,
        });
    } catch (error) {
        console.error("Error in processAndPostUploadData:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};




const fixMissingReferences = async () => {
    try {
        const documents = await ExcelUploadModel.find();
        for (const doc of documents) {
            if (!doc.category || !doc.subCategory) {
                console.warn(`Missing references for document: ${doc._id}`);

                // Find matching category and subCategory by name
                const matchedCategory = await CategoryModel.findOne({ name: doc.partsName });
                const matchedSubCategory = await SubCategoryModel.findOne({ name: doc.partsName });

                if (matchedCategory && matchedSubCategory) {
                    doc.category = matchedCategory._id;
                    doc.subCategory = matchedSubCategory._id;
                    await doc.save();
                    console.log(`Updated references for document: ${doc._id}`);
                } else {
                    console.warn(`No matches found for document: ${doc._id}`);
                }
            }
        }
        console.log("References updated successfully.");
    } catch (error) {
        console.error("Error updating references:", error.message);
    }
};

export const fixReferencesHandler = async (req, res) => {
    try {
        await fixMissingReferences();
        res.json({ success: true, message: "References fixed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getRejectedData = async (req, res) => {
    try {
        // Fetch rejected data
        const rejectedData = await ExcelUploadModel.aggregate([
            { $match: { status: "Rejected" } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory",
                },
            },
            {
                $project: {
                    partsCode: 1,
                    partsName: 1,
                    boxNo: 1,
                    qty: 1,
                    remark: 1, // Include remark field
                    "categoryName": { $arrayElemAt: ["$category.name", 0] },
                    "subCategoryName": { $arrayElemAt: ["$subCategory.name", 0] },
                },
            },
        ]);

        res.json({
            success: true,
            data: rejectedData,
        });
    } catch (error) {
        console.error("Error in getRejectedData:", error.message);
        res.status(500).json({ success: false, message: "Error fetching rejected data", error: error.message });
    }
};
