const express = require('express');
const productController = require('./product.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { ROLES } = require('../../common/constants');
const {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
} = require('./product.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listProductsSchema), productController.listProducts);
router.get('/:id', validate(productIdSchema), productController.getProduct);
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createProductSchema),
  productController.createProduct
);
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(productIdSchema),
  productController.deleteProduct
);

module.exports = router;
