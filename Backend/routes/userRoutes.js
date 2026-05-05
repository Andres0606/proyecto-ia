const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const fileController = require('../controllers/fileController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para registrar el perfil en la base de datos pública
router.post('/register', userController.registerUser);

// Ruta para iniciar sesión
router.post('/login', userController.loginUser);

// Rutas para subida de archivos
router.post('/upload-avatar', upload.single('image'), fileController.uploadProfileImage);
router.post('/upload-cv', upload.single('cv'), fileController.uploadResume);
router.get('/get-cv-url/:userId', fileController.getResumeUrl);

// Rutas de gestión de perfil completo
router.get('/profile/:userId', userController.getFullProfile);
router.put('/profile/:userId', userController.updateProfile);
router.post('/update-plan', userController.updatePlan);
router.post('/subscribe', userController.subscribe);

module.exports = router;
