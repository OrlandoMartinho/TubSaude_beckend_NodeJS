const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/NotificacoesController');

// Rota para obter todas as notificações do sistema apenas para o ADM
router.post('/', notificacoesController.obterTodasNotificacoes);

// Rota para apagar uma notificação de um notificação
router.post('/visulizar', notificacoesController.marcarNotificacaoComoLida);

module.exports = router;
