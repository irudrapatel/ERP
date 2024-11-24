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
    boxes: [], // Multiple boxes for add/out operations
    action: "Add", // Default action
  });

  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
    setData((prev) => ({ ...prev, boxes: updatedBoxes }));
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
        closeModal(); // Close the modal on successful submission
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 rounded">
          <h2 className="font-semibold text-lg">Manage Damaged Products</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={openModal}
          >
            Add/Out Damage
          </button>
        </div>

        {/* Modal Section */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
                onClick={closeModal}
              >
                ×
              </button>
              <h2 className="font-semibold text-lg mb-4">Add/Out Damage</h2>
              <form className="grid gap-4" onSubmit={handleSubmit}>
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
          </div>
        )}
      </div>
    </section>
  );
};

export default DamageProduct;
