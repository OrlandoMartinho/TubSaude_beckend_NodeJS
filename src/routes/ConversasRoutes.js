const express = require('express');
const router = express.Router();
const conversasController = require('../controllers/ConversasControllers');

// Rota para criar uma nova conversa entre um médico e um usuário
router.post('/criar', conversasController.criarConversa);

// Rota para listar conversas de um usuário ou médico
router.post('/listar', conversasController.listarConversas);
 
// Rota para eliminar uma conversa
router.post('/eliminar', conversasController.eliminarConversa);

module.exports = router;
