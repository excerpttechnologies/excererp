const express = require('express');
const router = express.Router();
const {
  createGoodsReceipt,
  getAllGoodsReceipts,
  updateGoodsReceipt
} = require('../../controllers/inventory/goodsReceiptController');

router.post('/goodsreceipt', createGoodsReceipt);
router.get('/goodsreceipt', getAllGoodsReceipts);
router.patch('/goodsreceipt/:id', updateGoodsReceipt);
module.exports = router;
