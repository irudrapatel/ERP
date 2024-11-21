import SubCategoryModel from "../models/subCategory.model.js";

// Add Sub Category
export const AddSubCategoryController = async (request, response) => {
    try {
        const { name, code, image, category, partsPerCamera } = request.body;

        if (!name || !code || !image || !category || category.length === 0) {
            return response.status(400).json({
                message: "Provide name, code, image, and at least one category.",
                error: true,
                success: false,
            });
        }

        const payload = {
            name,
            code,
            image,
            category,
            partsPerCamera: partsPerCamera || 1,
        };

        const createSubCategory = new SubCategoryModel(payload);
        const save = await createSubCategory.save();

        return response.json({
            message: "Sub Category Created",
            data: save,
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

// Get Sub Categories
export const getSubCategoryController = async (request, response) => {
    try {
        const data = await SubCategoryModel.find()
            .sort({ createdAt: -1 })
            .populate('category', 'name _id'); // Populate category details
        return response.json({
            message: "Sub Category data",
            data: data,
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

// Update Sub Category
export const updateSubCategoryController = async (request, response) => {
    try {
        const { _id, name, image, category } = request.body;

        const checkSub = await SubCategoryModel.findById(_id);

        if (!checkSub) {
            return response.status(400).json({
                message: "Sub Category not found with the provided _id.",
                error: true,
                success: false,
            });
        }

        const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(
            _id,
            { name, image, category },
            { new: true } // Return updated document
        );

        return response.json({
            message: "Updated Successfully",
            data: updateSubCategory,
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

// Delete Sub Category
export const deleteSubCategoryController = async (request, response) => {
    try {
        const { _id } = request.body;

        const deleteSub = await SubCategoryModel.findByIdAndDelete(_id);

        if (!deleteSub) {
            return response.status(400).json({
                message: "Sub Category not found with the provided _id.",
                error: true,
                success: false,
            });
        }

        return response.json({
            message: "Deleted Successfully",
            data: deleteSub,
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
