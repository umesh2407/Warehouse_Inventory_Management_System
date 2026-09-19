const { z } = require('zod');
const { ROLES } = require('../../common/constants');

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      email: z.string().trim().email('Valid email is required').optional(),
      role: z.enum([ROLES.WAREHOUSE_STAFF]).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});

const getUserSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
};
