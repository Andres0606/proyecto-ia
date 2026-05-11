const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/vacancies', adminController.getAllVacancies);
router.get('/distributions', adminController.getUserDistributions);
router.put('/users/:id', adminController.updateUser);
router.put('/vacancies/:id', adminController.updateVacancy);
router.delete('/vacancies/:id', adminController.deleteVacancy);

module.exports = router;
