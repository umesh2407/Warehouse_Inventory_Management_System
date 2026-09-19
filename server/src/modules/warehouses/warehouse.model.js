const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameNormalized: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
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

warehouseSchema.index(
  { nameNormalized: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

warehouseSchema.pre('validate', function normalizeName() {
  if (this.name) {
    this.nameNormalized = this.name.trim().toLowerCase();
  }
});

warehouseSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    location: this.location,
    capacity: this.capacity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
