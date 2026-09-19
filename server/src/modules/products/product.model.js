const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumStockLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.index(
  { sku: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

productSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    sku: this.sku,
    category: this.category,
    price: this.price,
    minimumStockLevel: this.minimumStockLevel,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
