const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');

router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getAllUsers);
router.get('/:id/companies', userController.getUserCompanies);

module.exports = router;
