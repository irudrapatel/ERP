import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const UploadProduct = () => {
  const [data, setData] = useState({
    category: [],
    subCategory: [],
    description: "",
    boxes: [], // Stores Box No. and Parts Qty
  });
  const allCategory = useSelector((state) => state.product.allCategory);
  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [history, setHistory] = useState([]); // Store history

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch upload history
  const fetchHistory = async () => {
    try {
      const response = await Axios(SummaryApi.getProduct);
      if (response.data.success) {
        const fetchedData = response.data.data.map((item) => ({
          categoryName: item.category[0]?.name || "N/A",
          subCategoryName: item.subCategory[0]?.name || "N/A",
          subCategoryCode: item.subCategory[0]?.code || "N/A",
          boxNo: item.boxes[0]?.boxNo || "N/A",
          partsQty: item.boxes[0]?.partsQty || 0,
          date: new Date(item.createdAt).toLocaleDateString(),
        }));
        setHistory(fetchedData);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  useEffect(() => {
    fetchHistory(); // Fetch history on component load
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    setData((prev) => ({
      ...prev,
      boxes: updatedBoxes,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        ...data,
        boxes: data.boxes.map((box) => ({
          boxNo: box.boxNo,
          partsQty: box.partsQty, // Correct key name
        })),
      };

      const response = await Axios({
        ...SummaryApi.createProduct,
        data: requestData,
      });

      if (response.data.success) {
        successAlert(response.data.message);
        setData({
          category: [],
          subCategory: [],
          description: "",
          boxes: [],
        });
        setIsModalOpen(false); // Close modal after submission
        fetchHistory(); // Refresh history after upload
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
          <h2 className="font-semibold text-lg">Inward Camera Part</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={openModal}
          >
            Upload Product
          </button>
        </div>

        {/* History Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-md mb-4">Upload Product History</h3>
          <div className="overflow-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 px-4 py-2">Category Name</th>
                  <th className="border border-gray-300 px-4 py-2">Sub Category Name</th>
                  <th className="border border-gray-300 px-4 py-2">Sub Category Code</th>
                  <th className="border border-gray-300 px-4 py-2">Box No.</th>
                  <th className="border border-gray-300 px-4 py-2">Qty</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{item.categoryName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.subCategoryName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.subCategoryCode}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.boxNo}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.partsQty}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 border border-gray-300 px-4 py-2">
                      No history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
                onClick={closeModal}
              >
                ×
              </button>
              <h2 className="font-semibold text-lg mb-4">Upload Product</h2>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                {/* Select Category */}
                <div className="grid gap-1">
                  <label className="font-medium">Camera Category</label>
                  <select
                    className="bg-blue-50 border w-full p-2 rounded"
                    value={selectCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      const category = allCategory.find((el) => el._id === value);
                      setData((prev) => ({
                        ...prev,
                        category: [category],
                        subCategory: [], // Clear subcategory on category change
                      }));
                      setSelectCategory(value);
                    }}
                  >
                    <option value="">Select Camera</option>
                    {allCategory.map((c) => (
                      <option value={c._id} key={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Sub Category */}
                <div className="grid gap-1">
                  <label className="font-medium">Select Camera Part</label>
                  <select
                    className="bg-blue-50 border w-full p-2 rounded"
                    value={selectSubCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      const subCategory = allSubCategory.find(
                        (el) => el._id === value
                      );
                      setData((prev) => ({
                        ...prev,
                        subCategory: [subCategory],
                      }));
                      setSelectSubCategory(value);
                    }}
                  >
                    <option value="">Select Part</option>
                    {allSubCategory
                      .filter((sub) =>
                        sub.category.some((cat) => cat._id === selectCategory)
                      )
                      .map((sub) => (
                        <option value={sub._id} key={sub._id}>
                          {`${sub.code} - ${sub.name}`}
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
                        onChange={(e) => handleBoxChange(index, "partsQty", e.target.value)}
                        className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                      />
                    </div>
                  ))}

                  {/* Total Box and Total Parts Quantity */}
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Total Box: {data.boxes.length}</span>
                    <span>
                      Total Parts Quantity:{" "}
                      {data.boxes.reduce(
                        (total, box) => total + Number(box.partsQty || 0),
                        0
                      )}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="grid gap-1">
                  <label htmlFor="description" className="font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Enter product description (optional)"
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    rows={3}
                    className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none"
                  />
                </div>

                {/* Submit */}
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
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

export default UploadProduct;
