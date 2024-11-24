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
    boxes: [],
    action: "Add",
  });

  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingBoxes, setExistingBoxes] = useState({});
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    category: "",
    subCategory: "",
    box: "",
    action: "",
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (data.category) {
      const filtered = allSubCategory.filter((sub) =>
        sub.category.some((cat) => cat._id === data.category)
      );
      setFilteredSubCategories(filtered);
      setData((prev) => ({ ...prev, subCategory: "", boxes: [] }));
      fetchExistingBoxes(data.category);
    }
  }, [data.category, allSubCategory]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchExistingBoxes = async (categoryId) => {
    try {
      const response = await Axios({
        ...SummaryApi.getDamagedBoxes,
        data: { categoryId },
      });

      if (response.data.success) {
        setExistingBoxes(response.data.data);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await Axios(SummaryApi.getDamageProducts);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

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
        ...SummaryApi.handleDamageProduct,
        data,
      });

      if (response.data.success) {
        successAlert(response.data.message);
        setData({ category: "", subCategory: "", boxes: [], action: "Add" });
        closeModal();
        fetchHistory();
        fetchExistingBoxes(data.category);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const applyFilters = () => {
    return history.filter((item) => {
      return (
        (!filters.date ||
          new Date(item.createdAt).toISOString().split("T")[0] === filters.date) &&
        (!filters.category || item.category?.name === filters.category) &&
        (!filters.subCategory || item.subCategory?.name === filters.subCategory) &&
        (!filters.box || item.boxNo === filters.box) &&
        (!filters.action || item.action === filters.action)
      );
    });
  };

// Sort the filtered history to display the latest entry first
const filteredHistory = applyFilters().sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

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

        {/* Filters */}
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-semibold text-md mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="font-medium block mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="font-medium block mb-1">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">All Categories</option>
                {allCategory.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium block mb-1">Subcategory</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.subCategory}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    subCategory: e.target.value,
                  }))
                }
              >
                <option value="">All Subcategories</option>
                {allSubCategory.map((sub) => (
                  <option key={sub._id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium block mb-1">Box No</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={filters.box}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, box: e.target.value }))
                }
                placeholder="Enter Box No."
              />
            </div>
            <div>
              <label className="font-medium block mb-1">Action</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.action}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, action: e.target.value }))
                }
              >
                <option value="">All Actions</option>
                <option value="Add">Add</option>
                <option value="Out">Out</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="mt-4 bg-gray-50 p-4 rounded shadow">
          <h3 className="font-semibold text-md mb-3">Damage Product History</h3>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-100 text-center">
                <th className="border border-gray-200 p-2">Category Name</th>
                <th className="border border-gray-200 p-2">Sub Category Name</th>
                <th className="border border-gray-200 p-2">Box No</th>
                <th className="border border-gray-200 p-2">Qty</th>
                <th className="border border-gray-200 p-2">Action</th>
                <th className="border border-gray-200 p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 text-center">
                    <td className="border border-gray-200 p-2">
                      {item.category?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {item.subCategory?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 p-2">{item.boxNo}</td>
                    <td className="border border-gray-200 p-2">{item.quantity}</td>
                    <td className="border border-gray-200 p-2">{item.action}</td>
                    <td className="border border-gray-200 p-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-gray-200 p-2 text-center">
                    No history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <label className="font-medium">Camera Category</label>
                  <select
                    className="bg-blue-50 border w-full p-2 rounded"
                    value={data.category}
                    onChange={(e) =>
                      setData({ ...data, category: e.target.value })
                    }
                  >
                    <option value="">Select Camera</option>
                    {allCategory.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="grid gap-1">
                  <label className="font-medium">Camera Part</label>
                  <select
                    className="bg-blue-50 border w-full p-2 rounded"
                    value={data.subCategory}
                    onChange={(e) =>
                      setData({ ...data, subCategory: e.target.value })
                    }
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
                        onChange={(e) =>
                          handleBoxChange(index, "boxNo", e.target.value)
                        }
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
                      {data.boxes.reduce(
                        (total, box) => total + Number(box.partsQty || 0),
                        0
                      )}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="grid gap-1">
                  <label className="font-medium">Action</label>
                  <select
                    className="bg-blue-50 border w-full p-2 rounded"
                    value={data.action}
                    onChange={(e) =>
                      setData({ ...data, action: e.target.value })
                    }
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
