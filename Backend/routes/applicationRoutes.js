const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Ruta para postularse a una vacante
router.post('/', applicationController.applyToVacancy);

// Ruta para obtener postulaciones de un usuario
router.get('/user/:userId', applicationController.getUserApplications);

module.exports = router;
