const inventoryService = require('./inventory.service');
const asyncHandler = require('../../common/asyncHandler');
const { sendSuccess } = require('../../common/response');

const listInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.listInventory(req.query);
  return sendSuccess(res, 200, 'Inventory retrieved successfully', result);
});

const addStock = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.addStock(req.body);
  return sendSuccess(res, 200, 'Stock added successfully', inventory);
});

const removeStock = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.removeStock(req.body);
  return sendSuccess(res, 200, 'Stock removed successfully', inventory);
});

const transferStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.transferStock(req.body);
  return sendSuccess(res, 200, 'Stock transferred successfully', result);
});

const getLowStock = asyncHandler(async (req, res) => {
  const items = await inventoryService.getLowStockProducts();
  return sendSuccess(res, 200, 'Low-stock products retrieved successfully', items);
});

module.exports = {
  listInventory,
  addStock,
  removeStock,
  transferStock,
  getLowStock,
};
