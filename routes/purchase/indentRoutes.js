const express = require('express');
const router = express.Router();
const indentController = require('../../controllers/purchase/indentController');

router.post('/create', indentController.createIndent);
// routes/indentRoutes.js
router.get('/get', indentController.getAllIndents);
router.put('/status/:id', indentController.updateIndentStatus);

module.exports = router;
