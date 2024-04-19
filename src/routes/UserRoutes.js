const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UserController');

//Rota para receber código de verificação
router.post('/verificar_email',UsersController.receberCodigo)
//Rota para cadastrar Usuario
router.post('/cadastrar', UsersController.cadastrarUsuario);
//Rota para Autenticar usuários
router.post('/login', UsersController.autenticarUsuario);
//Rota para obter usuários  
router.post('/todos_usuarios',UsersController.obterTodosUsuarios)
//Rota para Editar Usuario
router.put('/',UsersController.editarUsuario)
//Verificar Email Novo_token
router.post('/',UsersController.receberCodigoNovo)
//Rotas para eliminar Usuario
router.delete('/',UsersController.eliminarUsuario)
// Rota para obter usuário por accessToken
router.post('/obter-usuario-por-accesstoken', UsersController.obterUsuarioPorAccessToken);

module.exports = router;
