const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para registrar el perfil en la base de datos pública
router.post('/register', userController.registerUser);

// Ruta para iniciar sesión
router.post('/login', userController.loginUser);

module.exports = router;
