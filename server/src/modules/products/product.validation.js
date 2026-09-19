const { z } = require('zod');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../../common/constants');

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    sku: z.string().trim().min(1, 'SKU is required'),
    category: z.string().trim().min(1, 'Category is required'),
    price: z.number().min(0, 'Price must be greater than or equal to zero'),
    minimumStockLevel: z
      .number()
      .min(0, 'Minimum stock level must be greater than or equal to zero'),
  }),
});

const updateProductSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      sku: z.string().trim().min(1).optional(),
      category: z.string().trim().min(1).optional(),
      price: z.number().min(0).optional(),
      minimumStockLevel: z.number().min(0).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});

const productIdSchema = z.object({
  params: z.object({ id: objectId }),
});

const listProductsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
};
