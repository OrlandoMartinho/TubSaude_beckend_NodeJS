const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/NotificacoesController');

// Rota para obter todas as notificações de um médico específico
router.post('/', notificacoesController.obterTodasNotificacoes);

// Rota para apagar uma notificação de um médico
router.post('/visulizar', notificacoesController.marcarNotificacaoComoLida);

module.exports = router;
