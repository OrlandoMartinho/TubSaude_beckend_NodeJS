const express = require('express');
const router = express.Router();
const ContactosController = require('../controllers/ContatosController');

// Rota para cadastrar um novo contato
router.post('/cadastrar', ContactosController.cadastrarContacto);

// Rota para listar todos os contatos de um usuário
router.post('/listar', ContactosController.listarContactos);

// Rota para obter um contato por ID
router.post('/obterPorId', ContactosController.obterContactoPorId);

//Rota para responder usuário
router.post('/responder_usuario',ContactosController.responderUsuario)
// Rota para eliminar um contato por ID
router.delete('/eliminar/:id', ContactosController.eliminarContactoPeloId);

module.exports = router;
