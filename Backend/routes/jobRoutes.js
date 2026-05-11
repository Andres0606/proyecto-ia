const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Ruta para crear una nueva vacante
router.post('/', jobController.createVacancy);

// Ruta para obtener todas las vacantes (Pública)
router.get('/', jobController.getVacancies);

// Ruta para obtener las vacantes de una empresa específica
router.get('/my-vacancies/:userId', jobController.getMyVacancies);

// Rutas de gestión de vacante (estado y eliminación)
router.patch('/:id/status', jobController.toggleVacancyStatus);
router.put('/:id', jobController.updateVacancy);
router.delete('/:id', jobController.deleteVacancy);

module.exports = router;
