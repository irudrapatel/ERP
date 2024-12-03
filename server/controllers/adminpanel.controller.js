import Product from '../models/product.model.js';
import OutProduct from '../models/outproduct.model.js';
import DamageProduct from '../models/damageproduct.model.js';

export const getPartsSummary = async (req, res) => {
  try {
    const { categoryId } = req.query;

    // Fetch products under the given category
    const products = await Product.find({ "category._id": categoryId }).populate('subCategory');

    // Fetch outward products under the same category
    const outProducts = await OutProduct.find({ "category._id": categoryId });

    // Fetch damaged products under the same category
    const damageProducts = await DamageProduct.find({ "category._id": categoryId });

    // Construct summary data
    const summary = products.map((product) => {
      const subCategory = product.subCategory[0]; // Assuming one subCategory per product
      const partsCode = subCategory?.code || 'N/A';
      const partsName = subCategory?.name || 'N/A';
      
      // Calculate inward quantity
      const inwardQty = product.boxes.reduce((sum, box) => sum + box.partsQty, 0);

      // Calculate outward quantity
      const outwardQty = outProducts
        .filter((out) => out.subCategory._id.toString() === subCategory?._id.toString())
        .reduce((sum, out) => sum + out.quantity, 0);

      // Calculate damaged quantity
      const damageQty = damageProducts
        .filter((damage) => damage.subCategory._id.toString() === subCategory?._id.toString())
        .reduce((sum, damage) => sum + (damage.action === 'Add' ? damage.quantity : -damage.quantity), 0);

      // Determine last updated date
      const lastUpdated = [product.updatedAt, ...outProducts.map((o) => o.updatedAt), ...damageProducts.map((d) => d.updatedAt)]
        .sort((a, b) => new Date(b) - new Date(a))[0];

      return {
        partsCode,
        partsName,
        inwardQty,
        outwardQty,
        damageQty,
        lastUpdated,
      };
    });

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching parts summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parts summary",
    });
  }
};
