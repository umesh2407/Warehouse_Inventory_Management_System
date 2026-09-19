const Product = require('../products/product.model');
const Warehouse = require('../warehouses/warehouse.model');
const Inventory = require('../inventory/inventory.model');
const inventoryService = require('../inventory/inventory.service');

const getSummary = async () => {
  const [totalProducts, totalWarehouses, stockAgg, lowStockProducts] = await Promise.all([
    Product.countDocuments({ isDeleted: false }),
    Warehouse.countDocuments({ isDeleted: false }),
    Inventory.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
    inventoryService.getLowStockProducts(),
  ]);

  return {
    totalProducts,
    totalWarehouses,
    totalStockQuantity: stockAgg[0]?.total || 0,
    lowStockProducts: lowStockProducts.length,
  };
};

module.exports = {
  getSummary,
};
