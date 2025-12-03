const express = require('express');
const getAllItems = require('../../controllers/inventory/stockController').getAllItems; // Importing the controller function
const router = express.Router();

// Example GET route for fetching stock data
router.get('/data', getAllItems);

module.exports = router;