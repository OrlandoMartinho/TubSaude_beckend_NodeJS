const express = require('express');
const router = express.Router();
const admController = require('../controllers/AdmController');




// Rota para obter os dados do ADM
router.post('/', admController.autenticarAdm);



module.exports = router;
