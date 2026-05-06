const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Ruta para postularse a una vacante
router.post('/', applicationController.applyToVacancy);

module.exports = router;
