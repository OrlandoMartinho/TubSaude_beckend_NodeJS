const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/MedicoController');

// Rota para cadastrar um médico
router.post('/cadastrar', medicoController.cadastrarMedico);
//Rota para autenticar médico
router.post('/autenticar', medicoController.autenticarMedico)
// Rota para eliminar um médico
router.delete('/eliminar', medicoController.eliminarMedico);
// Rota para editar um médico
router.put('/editar', medicoController.editarMedico);
// Rota para obter todos os médicos de um instituto
router.post('/obterTodos', medicoController.obterTodos);
// Rota para obter um médico específico de um instituto
router.post('/obterUmPorAccessToken', medicoController.obterUmMedico);
//Rota para tornar um medico online
router.post('/marcarMedicoOnline',medicoController.marcarMedicoComoDisponivel)

////Rota para obter imagem
router.post('/obter_imagem',medicoController.imagemDoMedico)

module.exports = router;
