import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const OutProduct = () => {
  const allCategory = useSelector((state) => state.product.allCategory);
  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  const [data, setData] = useState({
    category: "",
    subCategory: "",
    box: "",
    quantity: "",
  });

  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredBoxes, setFilteredBoxes] = useState([]);
  const [selectedBoxQty, setSelectedBoxQty] = useState(0);

  // Update subcategories based on the selected category
  useEffect(() => {
    if (data.category) {
      const filtered = allSubCategory.filter((sub) =>
        sub.category.some((cat) => cat._id === data.category)
      );
      setFilteredSubCategories(filtered);
      setData((prev) => ({ ...prev, subCategory: "", box: "" })); // Reset subCategory and box
      setFilteredBoxes([]); // Clear boxes when category changes
    }
  }, [data.category, allSubCategory]);

// Fetch boxes for the selected subcategory
useEffect(() => {
  if (data.category && data.subCategory) {
    const fetchBoxes = async () => {
      try {
        const response = await Axios({
          ...SummaryApi.getProductByCategoryAndSubCategory,
          data: { categoryId: data.category, subCategoryId: data.subCategory },
        });

        if (response.data.success) {
          console.log("Fetched Products:", response.data.data); // Debug log
          const boxes = response.data.data
            .map((product) => product.boxes)
            .flat();

          console.log("Filtered Boxes:", boxes); // Debug log
          setFilteredBoxes(boxes);
        } else {
          console.error("No products found for subcategory.");
          setFilteredBoxes([]); // No products found
        }
      } catch (error) {
        console.error("Error fetching boxes:", error);
        AxiosToastError(error);
      }
    };

    fetchBoxes();
  } else {
    setFilteredBoxes([]); // Clear boxes if no subcategory is selected
  }
}, [data.category, data.subCategory]);

  // Update quantity display for the selected box
  useEffect(() => {
    if (data.box) {
      const selectedBox = filteredBoxes.find((box) => box._id === data.box);
      setSelectedBoxQty(selectedBox ? selectedBox.partsQty : 0);
    } else {
      setSelectedBoxQty(0);
    }
  }, [data.box, filteredBoxes]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios({
        ...SummaryApi.addOutProduct,
        data,
      });

      if (response.data.success) {
        successAlert(response.data.message);
        setData({ category: "", subCategory: "", box: "", quantity: "" });
        setFilteredBoxes([]);
        setSelectedBoxQty(0);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
        <h2 className="font-semibold text-lg mb-4">Outward Product</h2>
        <form className="grid gap-4 bg-gray-50 p-6 rounded shadow" onSubmit={handleSubmit}>
          {/* Select Category */}
          <div className="grid gap-1">
            <label className="font-medium">Camera Category</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
            >
              <option value="">Select Camera</option>
              {allCategory.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Subcategory */}
          <div className="grid gap-1">
            <label className="font-medium">Camera Part</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.subCategory}
              onChange={(e) => setData({ ...data, subCategory: e.target.value })}
              disabled={!filteredSubCategories.length}
            >
              <option value="">Select Part</option>
              {filteredSubCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Box */}
          <div className="grid gap-1">
            <label className="font-medium">Select Box</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.box}
              onChange={(e) => setData({ ...data, box: e.target.value })}
              disabled={!filteredBoxes.length}
            >
              <option value="">Select Box</option>
              {filteredBoxes.map((box, index) => (
                <option key={index} value={box._id}>
                  {`Box No: ${box.boxNo}`}
                </option>
              ))}
            </select>
          </div>

          {/* Display Total Quantity of Selected Box */}
          {data.box && (
            <div className="bg-gray-100 p-2 rounded text-sm font-medium">
              <p>
                Total Quantity of Selected Box: <span className="font-bold">{selectedBoxQty}</span>
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="grid gap-1">
            <label className="font-medium">Quantity</label>
            <input
              type="number"
              className="bg-blue-50 border w-full p-2 rounded"
              value={data.quantity}
              onChange={(e) => setData({ ...data, quantity: e.target.value })}
              placeholder="Enter Quantity"
            />
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

export default OutProduct;