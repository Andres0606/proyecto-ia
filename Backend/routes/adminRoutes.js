const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/vacancies', adminController.getAllVacancies);

module.exports = router;
