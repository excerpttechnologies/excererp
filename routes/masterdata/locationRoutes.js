const express = require('express');
const router = express.Router();

// Import controller functions from locationController.js
const locationController = require('../../controllers/masterdata/locationController');

// Define routes
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', locationController.createLocation);
router.put('/:id', locationController.updateLocation);

module.exports = router;
