const express = require('express');
const router = express.Router();
const MensagemIAController = require('../controllers/MensagemIaController');

// Rota para enviar mensagem para a IA
router.post('/enviar-mensagem', MensagemIAController.enviarMensagemIA);

// Rota para obter todas as mensagens da IA de um usuário
router.post('/obter-mensagens', MensagemIAController.obterMensagensIA);

// Rota para obter uma mensagem específica da IA de um usuário
router.post('/obter-mensagem', MensagemIAController.obterMensagemIA);

// Rota para apagar uma mensagem específica da IA de um usuário
router.post('/apagar-mensagem', MensagemIAController.apagarMensagemIA);

module.exports = router;
