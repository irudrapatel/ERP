import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const CameraDelivery = () => {
  const allCategory = useSelector((state) => state.product.allCategory);

  const [data, setData] = useState({
    iwonName: "",
    category: "",
    boxes: [],
  });
  const [selectCategory, setSelectCategory] = useState("");
  const [availableBoxes, setAvailableBoxes] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchAvailableBoxes = async (categoryName) => {
    try {
      const response = await Axios(SummaryApi.getReadyCameraHistory);
      if (response.data.success) {
        const boxes = response.data.data
          .filter((item) => item.category === categoryName) // Match category by name
          .flatMap((item) =>
            item.boxes.map((box) => ({
              ...box,
              category: item.category, // Add category for context
            }))
          )
          .filter((box) => box.partUIDs.length > 0); // Keep only boxes with non-zero UIDs
  
        setAvailableBoxes(boxes);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };
  

  useEffect(() => {
    if (data.category) {
      fetchAvailableBoxes(data.category);
    }
  }, [data.category]);

  const handleBoxSelection = (box) => {
    setSelectedBoxes((prev) => [...prev, box]);
    setAvailableBoxes((prev) => prev.filter((b) => b.boxNo !== box.boxNo)); // Remove selected box from available list
  };

  const handleUIDSelection = (boxIndex, uid) => {
    setSelectedBoxes((prev) => {
      const updatedBoxes = [...prev];
      const box = updatedBoxes[boxIndex];
      box.selectedUIDs = box.selectedUIDs || [];
      if (box.selectedUIDs.includes(uid)) {
        box.selectedUIDs = box.selectedUIDs.filter((id) => id !== uid); // Deselect UID
      } else {
        box.selectedUIDs.push(uid); // Select UID
      }
      return updatedBoxes;
    });
  };

  const handleSubmit = async () => {
    try {
      const deliveryData = {
        iwonName: data.iwonName,
        category: data.category,
        boxes: selectedBoxes.map((box) => ({
          boxNo: box.boxNo,
          selectedUIDs: box.selectedUIDs,
        })),
      };
      const response = await Axios({
        ...SummaryApi.deliverCamera,
        data: deliveryData,
      });
      if (response.data.success) {
        successAlert(response.data.message);
        setData({ iwonName: "", category: "", boxes: [] });
        setSelectedBoxes([]);
        setAvailableBoxes([]);
        setIsModalOpen(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCategory = allCategory.find((cat) => cat._id === categoryId);
    setData((prev) => ({ ...prev, category: selectedCategory.name }));
    setSelectCategory(categoryId);
    fetchAvailableBoxes(selectedCategory.name);
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between bg-white shadow-md p-4 rounded mb-4">
          <h2 className="font-semibold text-lg">Camera Delivery</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={openModal}
          >
            Deliver Camera
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
                onClick={closeModal}
              >
                ×
              </button>
              <h2 className="font-semibold text-lg mb-4">Deliver Camera</h2>
              <form className="grid gap-4">
                <div>
                  <label className="font-medium">IWON Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={data.iwonName}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, iwonName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="font-medium">Select Category</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {allCategory.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div>
  {/* Available Boxes Section */}
  <div>
    <label className="font-medium">Available Boxes</label>
    <div
      className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2"
      style={{ maxHeight: "150px" }} // Scrollable panel for available boxes
    >
      <ul className="grid grid-cols-3 gap-2">
        {availableBoxes.map((box) => (
          <li
            key={box.boxNo}
            className="bg-blue-50 text-center border rounded p-2 hover:bg-blue-100"
          >
            <button
              type="button"
              onClick={() => handleBoxSelection(box)}
              className="text-blue-500 hover:underline"
            >
              {box.boxNo}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* Selected Boxes Section */}
  <div className="mt-4">
    <h3 className="font-semibold">Selected Boxes</h3>
    <div
      className="max-h-60 overflow-y-auto border border-gray-300 rounded p-2"
      style={{ maxHeight: "200px" }} // Scrollable panel for selected boxes
    >
      {selectedBoxes.length === 0 ? (
        <p className="text-gray-500 text-sm">No boxes selected yet.</p>
      ) : (
        selectedBoxes.map((box, index) => (
          <div key={box.boxNo} className="mb-4">
            <h4 className="text-blue-600 font-medium">{box.boxNo}</h4>
            <ul className="grid grid-cols-3 gap-2">
              {box.partUIDs.slice(0, 9).map((uid) => ( // Limit to 9 UIDs per box
                <li
                  key={uid}
                  className="bg-gray-50 border rounded p-1 text-sm text-center"
                >
                  <label>
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={box.selectedUIDs?.includes(uid) || false}
                      onChange={() => handleUIDSelection(index, uid)}
                    />
                    {uid}
                  </label>
                </li>
              ))}
            </ul>
            {box.partUIDs.length > 9 && (
              <p className="text-gray-500 text-xs mt-1">
                Scroll to see more UIDs
              </p>
            )}
          </div>
        ))
      )}
    </div>
  </div>
</div>

                </div>
                <button
                  type="button"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  Submit Delivery
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CameraDelivery;
