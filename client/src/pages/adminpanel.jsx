import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import isAdmin from "../utils/isAdmin";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { combineBoxes } from "../utils";

const Dashboard = () => {
  const user = useSelector((state) => state.user);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [damagedProducts, setDamagedProducts] = useState([]); // For damaged products
  const [selectedCategory, setSelectedCategory] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          categoriesResponse,
          subCategoriesResponse,
          productsResponse,
          damagedProductsResponse,
        ] = await Promise.all([
          Axios({ ...SummaryApi.getCategory }),
          Axios({ ...SummaryApi.getSubCategory }),
          Axios({ ...SummaryApi.getProduct }),
          Axios({ ...SummaryApi.getDamageProducts }), // Fetch damaged products
        ]);

        if (categoriesResponse.data.success) setCategories(categoriesResponse.data.data);
        if (subCategoriesResponse.data.success) setSubCategories(subCategoriesResponse.data.data);
        if (productsResponse.data.success) setProducts(productsResponse.data.data);
        if (damagedProductsResponse.data.success)
          setDamagedProducts(damagedProductsResponse.data.data); // Store damaged products
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Helper to calculate subcategory data
  const getSubCategoryData = (subCategoryId) => {
    // Filter products for this subcategory
    const productData = products.filter((product) =>
      product.subCategory.some((sub) => sub._id === subCategoryId)
    );

    // Calculate total boxes and parts quantity
    const totalBoxes = productData.reduce(
      (acc, product) => acc + (product.boxes?.length || 0),
      0
    );

    const totalPartsQty = productData.reduce(
      (acc, product) =>
        acc +
        product.boxes?.reduce((boxAcc, box) => boxAcc + Number(box.partsQty || 0), 0),
      0
    );

    // Detailed boxes
    const detailedBoxes = productData.flatMap((product) =>
      product.boxes.map((box) => ({
        boxNo: box.boxNo,
        partsQty: box.partsQty,
        action: box.partsQty > 0 ? "Add" : "Out",
        dateAdded: product.updatedAt,
      }))
    );

    return { totalBoxes, totalPartsQty, detailedBoxes };
  };


  const calculatePossibleCameras = (categoryId) => {
    // Filter subcategories under the current category
    const relatedSubCategories = subCategories.filter((sub) =>
      sub.category.some((cat) => cat._id === categoryId)
    );
  
    if (relatedSubCategories.length === 0) return 0;
  
    // Calculate possible cameras for each subcategory
    const cameraCounts = relatedSubCategories.map((sub) => {
      // Fetch the total parts available for the subcategory
      const totalPartsAvailable = getSubCategoryData(sub._id).totalPartsQty;
  
      // Fetch partsPerCamera from the subcategory
      const partsPerCamera = sub.partsPerCamera || 1;
  
      // Calculate possible cameras for this subcategory
      return Math.floor(totalPartsAvailable / partsPerCamera);
    });
  
    // The minimum count across all subcategories determines the total possible cameras
    return Math.min(...cameraCounts);
  };
  

  // Helper to calculate total damaged parts for a subcategory
  const getTotalDamagedParts = (subCategoryId) => {
    const damagedData = damagedProducts.filter(
      (damage) => damage.subCategory._id === subCategoryId
    );

    const totalDamagedParts = damagedData.reduce((acc, damage) => {
      if (damage.action === "Add") return acc + damage.quantity;
      if (damage.action === "Out") return acc - damage.quantity;
      return acc;
    }, 0);

    return totalDamagedParts;
  };

  // Filter subcategories based on selected category
  const filteredSubCategories = subCategories.filter((sub) =>
    selectedCategory ? sub.category.some((cat) => cat._id === selectedCategory) : true
  );

  if (!isAdmin(user.role)) {
    return <div className="text-center text-red-600 font-bold py-10">Access Denied: Admins Only</div>;
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto p-3">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {categories.map((category) => {
            const possibleCameras = calculatePossibleCameras(category._id);
            return (
              <div key={category._id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-center mb-4">
                  {/* Category Image */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 object-cover" // Removed `rounded-full`
                  />
                </div>
                <h3 className="text-gray-600 text-center font-semibold text-lg mb-2">
                  {category.name}
                </h3>
                <p className="text-center text-sm text-gray-500">
                  Possible Cameras:{" "}
                  <span className="text-blue-500 font-bold text-xl">{possibleCameras}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Select Category</label>
          <select
            className="w-full p-2 border rounded-md bg-gray-50"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategories */}
        <div>
          {filteredSubCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSubCategories.map((sub) => {
                const { totalBoxes, totalPartsQty, detailedBoxes } = getSubCategoryData(sub._id);
                const totalDamagedParts = getTotalDamagedParts(sub._id); // Get total damaged parts

                return (
                  <div
                    key={sub._id}
                    className="bg-white shadow rounded-lg p-4 flex flex-col items-center"
                  >
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-32 object-contain mb-2 cursor-pointer"
                      onClick={() => setZoomedImage(sub.image)}
                    />
                    <h3 className="text-gray-600 font-medium text-center">{sub.name}</h3>
                    <div
                      className="cursor-pointer text-sm text-gray-500 text-center"
                      onClick={() => setSelectedDetails(detailedBoxes)}
                    >
                      <p>Code: {sub.code}</p>
                      <p>Total Available Boxes: {totalBoxes}</p>
                      <p>
                      Total Ready Parts: {totalPartsQty}
                    </p>
                      <p>Total Damaged Parts: {totalDamagedParts}</p> {/* New line */}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No subcategories found.</p>
          )}
        </div>
     {/* Image Zoom Modal */}
        {zoomedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full" />
            <button
              className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded"
              onClick={() => setZoomedImage(null)}
            >
              Close
            </button>
          </div>
        )}

     {/* Details Modal */}
        {selectedDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-lg font-bold mb-4">Box Details</h2>
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Box No.</th>
                    <th className="border border-gray-300 px-4 py-2">Parts Qty</th>
                    {/* <th className="border border-gray-300 px-4 py-2">Action</th> */}
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {combineBoxes(selectedDetails).map((box, index) => (
                    <tr key={index} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{box.boxNo}</td>
                      <td className="border border-gray-300 px-4 py-2">{box.partsQty}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(box.dateAdded).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              <button
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => setSelectedDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
