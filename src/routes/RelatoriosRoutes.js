const express = require('express');
const router = express.Router();
const RelatoriosController = require('../controllers/RelatorioController');

// Rota para cadastrar um novo relatório
router.post('/cadastrarRelatorio', RelatoriosController.cadastrarRelatorio);

// Rota para eliminar um relatório pelo ID do usuário
router.delete('/eliminarRelatorioPeloIdAcessToken', RelatoriosController.eliminarRelatorioPeloIdAcessToken);

// Rota para obter todos os relatórios de um usuário
router.post('/obterTodosRelatorioPeloTokenUsuario', RelatoriosController.obterTodosRelatorioPeloTokenUsuario);

// Rota para editar um relatório pelo ID do usuário
router.put('/editarRelatorioPeloTokenUsuaio', RelatoriosController.editarRelatorioPeloTokenUsuaio);

// Rota para fazer o download de um relatório em PDF
router.post('/downloadRelatorioPDF', RelatoriosController.downloadRelatorioPDF);

// Rota para obter todos os relatórios (apenas para administradores)
router.post('/todosRelatorios', RelatoriosController.todosRelatorios);

module.exports = router;
