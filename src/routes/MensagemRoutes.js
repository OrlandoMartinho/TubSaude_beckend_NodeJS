const express = require('express');
const router = express.Router();
const mensagensController = require('../controllers/MensagemController');

// Rota para enviar mensagem para um usuário
router.post('/enviar', mensagensController.enviarMensagem);

// Rota para listar pessoas com quem houve troca de mensagens
router.post('/listar', mensagensController.listarMensagens);

//Rota para editar uma mensagem
router.put('/',mensagensController.editarMensagem)

//Rota para excluir uma mensagem
router.delete('/',mensagensController.excluirMensagem)

//Rota para enviar uma mensagem de arquivo
router.post('/enviar_arquivo',mensagensController.enviarMensagemDeArquivo)

//Rota para eliminar um arquivo
router.delete('/eliminar_arquivo',mensagensController.excluirArquivo)

//Rota para obter um arquivo
router.post('/obter_arquivo/:nomeDoArquivo', mensagensController.retornarArquivo);

module.exports = router;
