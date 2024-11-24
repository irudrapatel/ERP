import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const ReadyCamera = () => {
  const [data, setData] = useState({
    category: "",
    boxes: [],
    description: "",
  });
  const allCategory = useSelector((state) => state.product.allCategory);
  const [selectCategory, setSelectCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    category: "",
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch upload history
  const fetchHistory = async () => {
    try {
      const response = await Axios(SummaryApi.getReadyCameraHistory);
      if (response.data.success) {
        // Update to reflect the new backend structure
        const fetchedData = response.data.data.map((item) => ({
          categoryName: item.category || "N/A", // Directly use category from backend
          totalQty: item.totalQty || 0,
          totalBoxes: item.totalBoxes || 0, // Include total box count
          date: new Intl.DateTimeFormat("en-GB").format(new Date(item.createdAt)),
        }));
        setHistory(fetchedData);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };
  
  
  useEffect(() => {
    fetchHistory();
  }, []);

  const applyFilters = () => {
    return history.filter((item) => {
      return (
        (!filters.date || item.date === new Intl.DateTimeFormat("en-GB").format(new Date(filters.date))) &&
        (!filters.category || item.categoryName === filters.category)
      );
    });
  };

  const filteredHistory = applyFilters();

  const handleBoxChange = (index, field, value) => {
    const updatedBoxes = [...data.boxes];
    updatedBoxes[index][field] = value;
    setData((prev) => ({
      ...prev,
      boxes: updatedBoxes,
    }));
  };

  const handleAddBox = () => {
    setData((prev) => ({
      ...prev,
      boxes: [...prev.boxes, { boxNo: "", partsQty: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        ...data,
        boxes: data.boxes.map((box) => ({
          boxNo: box.boxNo,
          partsQty: box.partsQty,
        })),
      };

      const response = await Axios({
        ...SummaryApi.createReadyCamera,
        data: requestData,
      });

      if (response.data.success) {
        successAlert(response.data.message);
        setData({
          category: "",
          boxes: [],
          description: "",
        });
        setIsModalOpen(false);
        fetchHistory();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 rounded mb-4">
          <h2 className="font-semibold text-lg">Ready Camera Inward</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={openModal}
          >
            Upload Ready Camera
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-semibold text-md mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium block mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={filters.date}
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-medium block mb-1">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="">All Categories</option>
                {allCategory.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
{/* History Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-md mb-4">Upload Ready Camera History</h3>
          <div className="overflow-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 px-4 py-2">Category Name</th>
                  <th className="border border-gray-300 px-4 py-2">Total Qty</th>
                  <th className="border border-gray-300 px-4 py-2">Total Box Qty</th> {/* New Column */}
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{item.categoryName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.totalQty}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.totalBoxes}</td> {/* Display total box count */}
                      <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 border border-gray-300 px-4 py-2">
                      No history available for the selected filters.
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
              <h2 className="font-semibold text-lg mb-4">Upload Ready Camera</h2>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                {/* Select Category */}
                <div className="grid gap-1">
                  <label className="font-medium">Select Category</label>
                  <select
                    className="bg-blue-50 border w-full p-2 rounded"
                    value={selectCategory}
                    onChange={(e) => {
                      setData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }));
                      setSelectCategory(e.target.value);
                    }}
                  >
                    <option value="">Select Category</option>
                    {allCategory.map((cat) => (
                      <option value={cat._id} key={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Boxes */}
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
                    Remarks
                  </label>
                  <textarea
                    id="description"
                    placeholder="Enter remarks (optional)"
                    name="description"
                    value={data.description}
                    onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
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

export default ReadyCamera;
