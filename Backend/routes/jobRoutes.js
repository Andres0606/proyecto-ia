const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Ruta para crear una nueva vacante
router.post('/', jobController.createVacancy);

// Ruta para obtener las vacantes de una empresa específica
router.get('/my-vacancies/:userId', jobController.getMyVacancies);

// Rutas de gestión de vacante (estado y eliminación)
router.patch('/:id/status', jobController.toggleVacancyStatus);
router.delete('/:id', jobController.deleteVacancy);

module.exports = router;
