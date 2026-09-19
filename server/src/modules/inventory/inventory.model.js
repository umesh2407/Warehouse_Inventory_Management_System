const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

inventorySchema.methods.toSafeObject = function toSafeObject() {
  const product = this.productId && this.productId._id ? this.productId : null;
  const warehouse = this.warehouseId && this.warehouseId._id ? this.warehouseId : null;

  return {
    id: this._id.toString(),
    productId: product ? product._id.toString() : this.productId.toString(),
    warehouseId: warehouse ? warehouse._id.toString() : this.warehouseId.toString(),
    quantity: this.quantity,
    product: product
      ? {
          id: product._id.toString(),
          name: product.name,
          sku: product.sku,
          minimumStockLevel: product.minimumStockLevel,
        }
      : undefined,
    warehouse: warehouse
      ? {
          id: warehouse._id.toString(),
          name: warehouse.name,
          location: warehouse.location,
          capacity: warehouse.capacity,
        }
      : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
