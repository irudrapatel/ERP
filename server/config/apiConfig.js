// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const SummaryApi = {
    baseURL: process.env.VITE_API_URL || "http://localhost:8080", // Fetch from .env or fallback to localhost
    getSubCategory: { url: "/api/subcategory/get", method: "post" },
    // Add other API configurations as needed
};

export default SummaryApi;
