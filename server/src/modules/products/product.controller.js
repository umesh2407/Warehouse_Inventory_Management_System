const productService = require('./product.service');
const asyncHandler = require('../../common/asyncHandler');
const { sendSuccess } = require('../../common/response');

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return sendSuccess(res, 201, 'Product created successfully', product);
});

const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  return sendSuccess(res, 200, 'Products retrieved successfully', result);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, 200, 'Product retrieved successfully', product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, 200, 'Product updated successfully', product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  return sendSuccess(res, 200, 'Product deleted successfully', product);
});

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
