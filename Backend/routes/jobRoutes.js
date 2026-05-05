const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Ruta para crear una nueva vacante
router.post('/', jobController.createVacancy);

// Ruta para obtener todas las vacantes
router.get('/', jobController.getVacancies);

module.exports = router;
