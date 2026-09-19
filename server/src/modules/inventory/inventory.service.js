const mongoose = require('mongoose');
const Inventory = require('./inventory.model');
const Product = require('../products/product.model');
const Warehouse = require('../warehouses/warehouse.model');
const ApiError = require('../../common/ApiError');

const assertProductExists = async (productId, session = null) => {
  const query = Product.findOne({ _id: productId, isDeleted: false });
  if (session) query.session(session);
  const product = await query;
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

const assertWarehouseExists = async (warehouseId, session = null) => {
  const query = Warehouse.findOne({ _id: warehouseId, isDeleted: false });
  if (session) query.session(session);
  const warehouse = await query;
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }
  return warehouse;
};

const getWarehouseTotalQuantity = async (warehouseId, session = null) => {
  const pipeline = [
    { $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) } },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ];

  const result = session
    ? await Inventory.aggregate(pipeline).session(session)
    : await Inventory.aggregate(pipeline);

  return result[0]?.total || 0;
};

const assertCapacity = async (warehouse, additionalQty, session = null) => {
  const currentTotal = await getWarehouseTotalQuantity(warehouse._id, session);
  if (currentTotal + additionalQty > warehouse.capacity) {
    throw new ApiError(422, 'Warehouse capacity exceeded');
  }
};

const formatInventory = async (inventoryDoc) => {
  const populated = await Inventory.findById(inventoryDoc._id)
    .populate('productId', 'name sku minimumStockLevel')
    .populate('warehouseId', 'name location capacity');

  return populated.toSafeObject();
};

const listInventory = async ({ productId, warehouseId, search, page, limit }) => {
  const filter = {};

  if (productId) filter.productId = productId;
  if (warehouseId) filter.warehouseId = warehouseId;

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    const products = await Product.find({
      isDeleted: false,
      $or: [{ name: regex }, { sku: regex }],
    }).select('_id');

    const productIds = products.map((p) => p._id);

    if (productId) {
      const matchesSearch = productIds.some((id) => id.toString() === productId);
      if (!matchesSearch) {
        return {
          items: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    } else {
      filter.productId = { $in: productIds };
    }
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Inventory.find(filter)
      .populate('productId', 'name sku minimumStockLevel')
      .populate('warehouseId', 'name location capacity')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Inventory.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => item.toSafeObject()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const addStock = async ({ productId, warehouseId, quantity }) => {
  await assertProductExists(productId);
  const warehouse = await assertWarehouseExists(warehouseId);
  await assertCapacity(warehouse, quantity);

  const inventory = await Inventory.findOneAndUpdate(
    { productId, warehouseId },
    { $inc: { quantity }, $setOnInsert: { productId, warehouseId } },
    { returnDocument: 'after', upsert: true, runValidators: true }
  );

  return formatInventory(inventory);
};

const removeStock = async ({ productId, warehouseId, quantity }) => {
  await assertProductExists(productId);
  await assertWarehouseExists(warehouseId);

  const inventory = await Inventory.findOneAndUpdate(
    { productId, warehouseId, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { returnDocument: 'after' }
  );

  if (!inventory) {
    const existing = await Inventory.findOne({ productId, warehouseId });
    if (!existing) {
      throw new ApiError(404, 'Inventory record not found');
    }
    throw new ApiError(422, 'Insufficient stock available');
  }

  return formatInventory(inventory);
};

const transferWithSession = async ({
  productId,
  sourceWarehouseId,
  destinationWarehouseId,
  quantity,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await assertProductExists(productId, session);
    await assertWarehouseExists(sourceWarehouseId, session);
    const destination = await assertWarehouseExists(destinationWarehouseId, session);

    const sourceUpdated = await Inventory.findOneAndUpdate(
      {
        productId,
        warehouseId: sourceWarehouseId,
        quantity: { $gte: quantity },
      },
      { $inc: { quantity: -quantity } },
      { returnDocument: 'after', session }
    );

    if (!sourceUpdated) {
      throw new ApiError(422, 'Insufficient stock available');
    }

    await assertCapacity(destination, quantity, session);

    const destinationUpdated = await Inventory.findOneAndUpdate(
      { productId, warehouseId: destinationWarehouseId },
      {
        $inc: { quantity },
        $setOnInsert: { productId, warehouseId: destinationWarehouseId },
      },
      { returnDocument: 'after', upsert: true, runValidators: true, session }
    );

    await session.commitTransaction();

    return {
      source: await formatInventory(sourceUpdated),
      destination: await formatInventory(destinationUpdated),
    };
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
};

const transferWithoutSession = async ({
  productId,
  sourceWarehouseId,
  destinationWarehouseId,
  quantity,
}) => {
  await assertProductExists(productId);
  await assertWarehouseExists(sourceWarehouseId);
  const destination = await assertWarehouseExists(destinationWarehouseId);

  const sourceUpdated = await Inventory.findOneAndUpdate(
    {
      productId,
      warehouseId: sourceWarehouseId,
      quantity: { $gte: quantity },
    },
    { $inc: { quantity: -quantity } },
    { returnDocument: 'after' }
  );

  if (!sourceUpdated) {
    throw new ApiError(422, 'Insufficient stock available');
  }

  try {
    await assertCapacity(destination, quantity);

    const destinationUpdated = await Inventory.findOneAndUpdate(
      { productId, warehouseId: destinationWarehouseId },
      {
        $inc: { quantity },
        $setOnInsert: { productId, warehouseId: destinationWarehouseId },
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return {
      source: await formatInventory(sourceUpdated),
      destination: await formatInventory(destinationUpdated),
    };
  } catch (err) {
    await Inventory.findOneAndUpdate(
      { productId, warehouseId: sourceWarehouseId },
      { $inc: { quantity } }
    );
    throw err;
  }
};

const isTransactionUnsupported = (err) => {
  const message = err?.message || '';
  return (
    err?.code === 20 ||
    message.includes('Transaction numbers are only allowed') ||
    message.includes('replica set')
  );
};

const transferStock = async ({
  productId,
  sourceWarehouseId,
  destinationWarehouseId,
  quantity,
}) => {
  if (sourceWarehouseId === destinationWarehouseId) {
    throw new ApiError(422, 'Source and destination warehouses must be different');
  }

  try {
    return await transferWithSession({
      productId,
      sourceWarehouseId,
      destinationWarehouseId,
      quantity,
    });
  } catch (err) {
    if (err instanceof ApiError || !isTransactionUnsupported(err)) {
      throw err;
    }
    return transferWithoutSession({
      productId,
      sourceWarehouseId,
      destinationWarehouseId,
      quantity,
    });
  }
};

const getLowStockProducts = async () => {
  const results = await Product.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'inventories',
        localField: '_id',
        foreignField: 'productId',
        as: 'inventory',
      },
    },
    {
      $addFields: {
        totalStock: { $sum: '$inventory.quantity' },
      },
    },
    {
      $match: {
        $expr: { $lt: ['$totalStock', '$minimumStockLevel'] },
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        name: 1,
        sku: 1,
        category: 1,
        minimumStockLevel: 1,
        totalStock: 1,
      },
    },
    { $sort: { totalStock: 1 } },
  ]);

  return results;
};

module.exports = {
  listInventory,
  addStock,
  removeStock,
  transferStock,
  getLowStockProducts,
  getWarehouseTotalQuantity,
};
