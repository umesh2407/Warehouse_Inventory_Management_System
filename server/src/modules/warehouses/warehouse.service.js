const Warehouse = require('./warehouse.model');
const Inventory = require('../inventory/inventory.model');
const ApiError = require('../../common/ApiError');

const toSafeWarehouse = (warehouse) => warehouse.toSafeObject();

const createWarehouse = async (payload) => {
  const nameNormalized = payload.name.trim().toLowerCase();
  const existing = await Warehouse.findOne({ nameNormalized, isDeleted: false });
  if (existing) {
    throw new ApiError(409, 'Warehouse name already exists');
  }

  try {
    const warehouse = await Warehouse.create({
      name: payload.name.trim(),
      nameNormalized,
      location: payload.location.trim(),
      capacity: payload.capacity,
    });
    return toSafeWarehouse(warehouse);
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'Warehouse name already exists');
    }
    throw err;
  }
};

const listWarehouses = async ({ page, limit }) => {
  const filter = { isDeleted: false };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Warehouse.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Warehouse.countDocuments(filter),
  ]);

  return {
    items: items.map(toSafeWarehouse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const getWarehouseById = async (id) => {
  const warehouse = await Warehouse.findOne({ _id: id, isDeleted: false });
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }
  return toSafeWarehouse(warehouse);
};

const updateWarehouse = async (id, updates) => {
  const warehouse = await Warehouse.findOne({ _id: id, isDeleted: false });
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }

  if (updates.name !== undefined) {
    const nameNormalized = updates.name.trim().toLowerCase();
    const conflict = await Warehouse.findOne({
      nameNormalized,
      isDeleted: false,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new ApiError(409, 'Warehouse name already exists');
    }
    warehouse.name = updates.name.trim();
    warehouse.nameNormalized = nameNormalized;
  }

  if (updates.location !== undefined) {
    warehouse.location = updates.location.trim();
  }
  if (updates.capacity !== undefined) {
    warehouse.capacity = updates.capacity;
  }

  try {
    await warehouse.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'Warehouse name already exists');
    }
    throw err;
  }

  return toSafeWarehouse(warehouse);
};

const deleteWarehouse = async (id) => {
  const warehouse = await Warehouse.findOne({ _id: id, isDeleted: false });
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }

  const stock = await Inventory.findOne({
    warehouseId: id,
    quantity: { $gt: 0 },
  });

  if (stock) {
    throw new ApiError(422, 'Cannot delete warehouse with existing stock');
  }

  warehouse.isDeleted = true;
  warehouse.deletedAt = new Date();
  await warehouse.save();

  return toSafeWarehouse(warehouse);
};

module.exports = {
  createWarehouse,
  listWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  toSafeWarehouse,
};
