const express = require('express');
const router = express.Router();
const conversasController = require('../controllers/ConversasControllers');

// Rota para criar uma nova conversa entre o usuário e o ADM
router.post('/criar', conversasController.criarConversa);

// Rota para listar todas conversas do sistema
router.post('/listar', conversasController.listarConversas);
 
// Rota para eliminar uma conversa
router.delete('/', conversasController.eliminarConversa);

module.exports = router;
