const warehouseService = require('./warehouse.service');
const asyncHandler = require('../../common/asyncHandler');
const { sendSuccess } = require('../../common/response');

const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.createWarehouse(req.body);
  return sendSuccess(res, 201, 'Warehouse created successfully', warehouse);
});

const listWarehouses = asyncHandler(async (req, res) => {
  const result = await warehouseService.listWarehouses(req.query);
  return sendSuccess(res, 200, 'Warehouses retrieved successfully', result);
});

const getWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.getWarehouseById(req.params.id);
  return sendSuccess(res, 200, 'Warehouse retrieved successfully', warehouse);
});

const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
  return sendSuccess(res, 200, 'Warehouse updated successfully', warehouse);
});

const deleteWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.deleteWarehouse(req.params.id);
  return sendSuccess(res, 200, 'Warehouse deleted successfully', warehouse);
});

module.exports = {
  createWarehouse,
  listWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
