const { z } = require('zod');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../../common/constants');

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const stockMutationSchema = z.object({
  body: z.object({
    productId: objectId,
    warehouseId: objectId,
    quantity: z.number().int().positive('Quantity must be greater than zero'),
  }),
});

const transferSchema = z.object({
  body: z.object({
    productId: objectId,
    sourceWarehouseId: objectId,
    destinationWarehouseId: objectId,
    quantity: z.number().int().positive('Quantity must be greater than zero'),
  }),
});

const listInventorySchema = z.object({
  query: z.object({
    productId: objectId.optional(),
    warehouseId: objectId.optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  }),
});

module.exports = {
  stockMutationSchema,
  transferSchema,
  listInventorySchema,
};
