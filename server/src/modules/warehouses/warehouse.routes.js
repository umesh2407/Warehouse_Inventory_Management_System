const express = require('express');
const warehouseController = require('./warehouse.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { ROLES } = require('../../common/constants');
const {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseIdSchema,
  listWarehousesSchema,
} = require('./warehouse.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listWarehousesSchema), warehouseController.listWarehouses);
router.get('/:id', validate(warehouseIdSchema), warehouseController.getWarehouse);
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createWarehouseSchema),
  warehouseController.createWarehouse
);
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(warehouseIdSchema),
  warehouseController.deleteWarehouse
);

module.exports = router;
