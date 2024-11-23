import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IoClose } from "react-icons/io5";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const UploadProduct = () => {
  const [data, setData] = useState({
    category: [],
    subCategory: [],
    description: '',
    boxes: [], // Stores Box No. and Parts Qty
  });
  const allCategory = useSelector(state => state.product.allCategory);
  const allSubCategory = useSelector(state => state.product.allSubCategory);
  const [selectCategory, setSelectCategory] = useState('');
  const [selectSubCategory, setSelectSubCategory] = useState('');
  const [ViewImageURL, setViewImageURL] = useState('');

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
      boxes: [...prev.boxes, { boxNo: '', partsQty: '' }],
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
  
      const { data: responseData } = response;
      if (responseData.success) {
        successAlert(responseData.message);
        setData({
          category: [],
          subCategory: [],
          description: '',
          boxes: [],
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };
  

  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
      <h2 className="font-semibold text-lg mb-4">Inward Camera Part</h2>
        <form className="grid gap-4 bg-gray-50 p-6 rounded shadow" onSubmit={handleSubmit}>
          {/* Select Category */}
          <div className="grid gap-1">
            <label className="font-medium">Camera Category</label>
            <select
              className="bg-blue-50 border w-full p-2 rounded"
              value={selectCategory}
              onChange={(e) => {
                const value = e.target.value;
                const category = allCategory.find(el => el._id === value);
                setData((prev) => ({
                  ...prev,
                  category: [category],
                  subCategory: [], // Clear subcategory on category change
                }));
                setSelectCategory(value);
              }}
            >
              <option value={''}>Select Camera</option>
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
                const subCategory = allSubCategory.find(el => el._id === value);
                setData((prev) => ({
                  ...prev,
                  subCategory: [subCategory],
                }));
                setSelectSubCategory(value);
              }}
            >
              <option value={''}>Select Part</option>
              {allSubCategory
                .filter(sub => sub.category.some(cat => cat._id === selectCategory))
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
                  onChange={(e) => handleBoxChange(index, 'boxNo', e.target.value)}
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
                <input
                  type="number"
                  placeholder="Parts Qty"
                  value={box.partsQty}
                  onChange={(e) =>
                    handleBoxChange(index, 'partsQty', e.target.value)
                  }
                  className="bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded"
                />
              </div>
            ))}

            {/* Total Box and Total Parts Quantity in One Line */}
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Total Box: {data.boxes.length}</span>
              <span>
                Total Parts Quantity:{" "}
                {data.boxes.reduce((total, box) => total + Number(box.partsQty || 0), 0)}
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

      {/* Image Viewer */}
      {ViewImageURL && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setViewImageURL('')}
        >
          <img src={ViewImageURL} alt="Zoomed" className="max-w-full max-h-full" />
        </div>
      )}
      {/* End Section */}
    </section>
  );
};

export default UploadProduct;
