const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Ruta para postularse a una vacante
router.post('/', applicationController.applyToVacancy);

// Ruta para obtener postulaciones de un usuario
router.get('/user/:userId', applicationController.getUserApplications);

// Ruta para obtener postulaciones recibidas por una empresa
router.get('/company/:userId', applicationController.getCompanyApplications);

// Ruta para actualizar estado de postulación
router.patch('/:id/status', applicationController.updateApplicationStatus);

module.exports = router;

