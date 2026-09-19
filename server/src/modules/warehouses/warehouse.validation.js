const { z } = require('zod');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../../common/constants');

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    location: z.string().trim().min(1, 'Location is required'),
    capacity: z.number().min(0, 'Capacity must be greater than or equal to zero'),
  }),
});

const updateWarehouseSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      location: z.string().trim().min(1).optional(),
      capacity: z.number().min(0).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});

const warehouseIdSchema = z.object({
  params: z.object({ id: objectId }),
});

const listWarehousesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  }),
});

module.exports = {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseIdSchema,
  listWarehousesSchema,
};
