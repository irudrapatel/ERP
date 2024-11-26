import ProductModel from "../models/product.model.js";

export const createProductController = async (request, response) => {
    try {
        const {
            category,
            subCategory,
            boxes,
            description,
            more_details,
        } = request.body;

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
            .populate("category subCategory"); // Populate related fields

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
