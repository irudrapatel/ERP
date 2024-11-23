import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const DamageProduct = () => {
  const allCategory = useSelector((state) => state.product.allCategory);
  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  const [data, setData] = useState({
    category: "",
    subCategory: "",
    boxes: [], // Manually added boxes
    action: "Add", // Default action
  });

  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  useEffect(() => {
    if (data.category) {
      const filtered = allSubCategory.filter((sub) =>
        sub.category.some((cat) => cat._id === data.category)
      );
      setFilteredSubCategories(filtered);
      setData((prev) => ({ ...prev, subCategory: "", boxes: [] }));
    }
  }, [data.category, allSubCategory]);

  const handleAddBox = () => {
    setData((prev) => ({
      ...prev,
      boxes: [...prev.boxes, { boxNo: "", partsQty: "" }],
    }));
  };

  const handleBoxChange = (index, field, value) => {
    const updatedBoxes = [...data.boxes];
    updatedBoxes[index][field] = value;
    setData((prev) => ({
      ...prev,
      boxes: updatedBoxes,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios({
        ...SummaryApi.handleDamageProduct, // Use appropriate endpoint
        data,
      });

      if (response.data.success) {
        successAlert(response.data.message);
        setData({ category: "", subCategory: "", boxes: [], action: "Add" });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
        <h2 className="font-semibold text-lg mb-4">Manage Damaged Products</h2>
        <form className="grid gap-4 bg-gray-50 p-6 rounded shadow" onSubmit={handleSubmit}>
          {/* Category */}
          <div className="grid gap-1">
            <label className="font-medium">Category</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {allCategory.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="grid gap-1">
            <label className="font-medium">Subcategory</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.subCategory}
              onChange={(e) => setData({ ...data, subCategory: e.target.value })}
              disabled={!filteredSubCategories.length}
            >
              <option value="">Select Subcategory</option>
              {filteredSubCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Box */}
          <div>
            <button
              type="button"
              className="hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded"
              onClick={handleAddBox}
            >
              Add Box
            </button>
            {data.boxes.map((box, index) => (
              <div className="grid grid-cols-2 gap-4 mt-2" key={index}>
                <input
                  type="text"
                  placeholder="Box No."
                  value={box.boxNo}
                  onChange={(e) => handleBoxChange(index, "boxNo", e.target.value)}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
                <input
                  type="number"
                  placeholder="Parts Qty"
                  value={box.partsQty}
                  onChange={(e) =>
                    handleBoxChange(index, "partsQty", e.target.value)
                  }
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>
            ))}

            {/* Total Box and Total Parts Quantity */}
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Total Boxes: {data.boxes.length}</span>
              <span>
                Total Parts Quantity:{" "}
                {data.boxes.reduce((total, box) => total + Number(box.partsQty || 0), 0)}
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="grid gap-1">
            <label className="font-medium">Action</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.action}
              onChange={(e) => setData({ ...data, action: e.target.value })}
            >
              <option value="Add">Add</option>
              <option value="Out">Out</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default DamageProduct;
