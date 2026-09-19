const Product = require('./product.model');
const Inventory = require('../inventory/inventory.model');
const ApiError = require('../../common/ApiError');

const toSafeProduct = (product) => product.toSafeObject();

const createProduct = async (payload) => {
  const sku = payload.sku.trim().toUpperCase();
  const existing = await Product.findOne({ sku, isDeleted: false });
  if (existing) {
    throw new ApiError(409, 'SKU already exists');
  }

  try {
    const product = await Product.create({
      name: payload.name.trim(),
      sku,
      category: payload.category.trim(),
      price: payload.price,
      minimumStockLevel: payload.minimumStockLevel,
    });
    return toSafeProduct(product);
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'SKU already exists');
    }
    throw err;
  }
};

const listProducts = async ({ search, page, limit }) => {
  const filter = { isDeleted: false };

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { sku: regex }];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map(toSafeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const getProductById = async (id) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return toSafeProduct(product);
};

const updateProduct = async (id, updates) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (updates.sku !== undefined) {
    const sku = updates.sku.trim().toUpperCase();
    const conflict = await Product.findOne({
      sku,
      isDeleted: false,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new ApiError(409, 'SKU already exists');
    }
    product.sku = sku;
  }

  if (updates.name !== undefined) product.name = updates.name.trim();
  if (updates.category !== undefined) product.category = updates.category.trim();
  if (updates.price !== undefined) product.price = updates.price;
  if (updates.minimumStockLevel !== undefined) {
    product.minimumStockLevel = updates.minimumStockLevel;
  }

  try {
    await product.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'SKU already exists');
    }
    throw err;
  }

  return toSafeProduct(product);
};

const deleteProduct = async (id) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const stock = await Inventory.findOne({
    productId: id,
    quantity: { $gt: 0 },
  });

  if (stock) {
    throw new ApiError(422, 'Cannot delete product with existing stock');
  }

  product.isDeleted = true;
  product.deletedAt = new Date();
  await product.save();

  return toSafeProduct(product);
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toSafeProduct,
};
