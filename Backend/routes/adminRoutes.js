const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/vacancies', adminController.getAllVacancies);
router.get('/distributions', adminController.getUserDistributions);

module.exports = router;
