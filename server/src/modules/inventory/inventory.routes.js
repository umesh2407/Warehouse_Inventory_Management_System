const express = require('express');
const inventoryController = require('./inventory.controller');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const {
  stockMutationSchema,
  transferSchema,
  listInventorySchema,
} = require('./inventory.validation');

const router = express.Router();

router.use(authenticate);

router.get('/low-stock', inventoryController.getLowStock);
router.get('/', validate(listInventorySchema), inventoryController.listInventory);
router.post('/add', validate(stockMutationSchema), inventoryController.addStock);
router.post('/remove', validate(stockMutationSchema), inventoryController.removeStock);
router.post('/transfer', validate(transferSchema), inventoryController.transferStock);

module.exports = router;
