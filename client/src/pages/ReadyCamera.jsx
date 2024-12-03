import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";
import { utils, writeFile } from "xlsx"; // Import XLSX for Excel generation 

const ReadyCamera = () => {
  const allCategory = useSelector((state) => state.product.allCategory);

  const [data, setData] = useState({
    category: "",
    boxes: [],
    description: "",
  });
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
        const fetchedData = response.data.data.map((item) => ({
          categoryName: item.category,
          createdAt: new Intl.DateTimeFormat("en-GB").format(new Date(item.createdAt)),
          boxes: item.boxes.map((box) => ({
            boxNo: box.boxNo,
            partUIDs: Array.isArray(box.partUIDs) ? box.partUIDs : [], // Ensure partUIDs is an array
            totalParts: box.totalParts || 0,
          })),
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
      const formattedDate = filters.date
        ? new Intl.DateTimeFormat("en-GB").format(new Date(filters.date))
        : null;

      const matchesDate = !filters.date || item.createdAt === formattedDate;
      const matchesCategory = !filters.category || item.categoryName === filters.category;

      return matchesDate && matchesCategory;
    });
  };

  const filteredHistory = applyFilters();

  const handleBoxChange = (index, field, value, event) => {
    const updatedBoxes = [...data.boxes]; // Clone the boxes array
  
    if (field === "partUIDs") {
      if (event && event.key === "Enter") {
        event.preventDefault(); // Prevent Enter key's default action
        const trimmedValue = value.trim();
        if (trimmedValue) {
          // Safely add new UID to the partUIDs array
          updatedBoxes[index].partUIDs = [
            ...(updatedBoxes[index].partUIDs || []),
            trimmedValue,
          ];
          updatedBoxes[index].totalParts = updatedBoxes[index].partUIDs.length;
          updatedBoxes[index].inputValue = ""; // Clear input after adding
        }
      } else {
        // Update the live input value without affecting the partUIDs list
        updatedBoxes[index].inputValue = value;
      }
    } else {
      updatedBoxes[index][field] = value; // Handle other fields
    }
  
    setData((prev) => ({
      ...prev,
      boxes: updatedBoxes,
    }));
  };
  
  const handleDeleteUID = (boxIndex, uidIndex) => {
    const updatedBoxes = [...data.boxes];
    updatedBoxes[boxIndex].partUIDs.splice(uidIndex, 1); // Remove the UID
    updatedBoxes[boxIndex].totalParts = updatedBoxes[boxIndex].partUIDs.length; // Update total
    setData((prev) => ({
      ...prev,
      boxes: updatedBoxes,
    }));
  };
  
  

  const handleAddBox = () => {
    setData((prev) => ({
      ...prev,
      boxes: [
        ...prev.boxes,
        { boxNo: "", partUIDs: [], totalParts: 0, inputValue: "" }, // Initialize fields
      ],
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({
        ...SummaryApi.createReadyCamera,
        data: data,
      });
      if (response.data.success) {
        successAlert(response.data.message);
        setData({ category: "", boxes: [], description: "" });
        setIsModalOpen(false);
        fetchHistory();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to submit the ready camera.";
      AxiosToastError(new Error(errorMessage));
    }
  };

  const downloadReadyCameraHistory = () => {
    if (filteredHistory.length === 0) {
      alert("No data available to download.");
      return;
    }
  
    // Format data for Excel export
    const formattedData = filteredHistory.flatMap((item) =>
      item.boxes.map((box) => ({
        "Category Name": item.categoryName || "N/A",
        "Box No.": box.boxNo || "N/A",
        "Part UID": box.partUIDs.join(", ") || "N/A", // Join UIDs as a single string
        "Total Qty": box.totalParts || 0,
        "Date": item.createdAt || "N/A",
      }))
    );
  
    // Create worksheet and workbook
    const worksheet = utils.json_to_sheet(formattedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "ReadyCameraHistory");
  
    // Save Excel file
    writeFile(workbook, "Ready_Camera_History.xlsx");
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
          </div>
        </div>

          {/* History Table */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-md">Ready Camera History</h3>
              <button
                className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
                onClick={downloadReadyCameraHistory}
              >
                Download
              </button>
            </div>
            <div className="overflow-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 px-4 py-2">Category Name</th>
                    <th className="border border-gray-300 px-4 py-2">Box No.</th>
                    <th className="border border-gray-300 px-4 py-2">Part UID</th>
                    <th className="border border-gray-300 px-4 py-2">Total Qty</th>
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) =>
                      item.boxes.map((box, boxIndex) => (
                        <tr key={`${index}-${boxIndex}`} className="text-center">
                          {boxIndex === 0 && (
                            <td
                              rowSpan={item.boxes.length}
                              className="border border-gray-300 px-4 py-2 align-top"
                            >
                              {item.categoryName}
                            </td>
                          )}
                          <td className="border border-gray-300 px-4 py-2">{box.boxNo}</td>
                          <td className="border border-gray-300 px-4 py-2 whitespace-pre-wrap">
                            {box.partUIDs.join("\n")}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{box.totalParts}</td>
                          {boxIndex === 0 && (
                            <td
                              rowSpan={item.boxes.length}
                              className="border border-gray-300 px-4 py-2 align-top"
                            >
                              {item.createdAt}
                            </td>
                          )}
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-gray-500 border border-gray-300 px-4 py-2"
                      >
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
                  className="bg-gray-100 py-1 px-3 rounded"
                  onClick={handleAddBox}
                >
                  Add Box
                </button>
                {data.boxes.map((box, index) => (
                  <div key={index} className="mt-2">
                    <input
                      type="text"
                      placeholder="Box No."
                      value={box.boxNo}
                      onChange={(e) =>
                        handleBoxChange(index, "boxNo", e.target.value)
                      }
                      className="w-full mb-1 p-2 border rounded"
                    />
                    <div>
                      <textarea
                        placeholder="Enter Part UIDs (one per line)"
                        value={data.boxes[index].inputValue || ""} // Show current live input value
                        onKeyDown={(e) =>
                          handleBoxChange(index, "partUIDs", e.target.value, e)
                        }
                        onChange={(e) =>
                          handleBoxChange(index, "partUIDs", e.target.value)
                        }
                        className="w-full p-1 border rounded" // Adjusted padding for a smaller textarea
                        rows={2} // Reduced number of rows for smaller height
                        style={{ whiteSpace: "pre-wrap" }} // Preserve newlines
                      ></textarea>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-1 font-medium text-gray-600">
                            Part UIDs:
                          </div>
                          <div className="col-span-1 text-right">
                            Total Parts:{" "}
                            <strong>{data.boxes[index].totalParts || 0}</strong>
                          </div>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {(data.boxes[index].partUIDs || []).map((uid, uidIndex) => (
                            <li
                              key={uidIndex}
                              className="flex justify-between items-center p-1 bg-gray-100 rounded"
                            >
                              <span className="text-sm text-gray-700">{uid}</span>
                              <button
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => handleDeleteUID(index, uidIndex)}
                              >
                                ✖
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Total Boxes: {data.boxes.length}</span>
                <span>
                  Total Parts Quantity:{" "}
                  {data.boxes.reduce(
                    (total, box) => total + (box.totalParts || 0),
                    0
                  )}
                </span>
              </div>

              <textarea
                className="bg-blue-50 p-2 w-full rounded mt-2"
                placeholder="Enter remarks (optional)"
                value={data.description}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, description: e.target.value }))
                }
              ></textarea>

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

export default ReadyCamera;
