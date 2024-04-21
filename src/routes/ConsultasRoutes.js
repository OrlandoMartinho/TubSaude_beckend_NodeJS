const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/ConsultasControllers');

// Rota para marcar uma consulta
router.post('/marcar', consultasController.cadastrarConsulta);

// Rota para concluir uma consulta
router.post('/confirmar_consulta', consultasController.confirmarConsulta);

// Rota para excluir uma consulta 
router.delete('/', consultasController.eliminarConsultaPeloIdAcessToken);

// Rota para obter todas consultas do Administrador
router.post('/todas_consultas', consultasController.obterTodasConsultaPeloTokenADM);

//Rota para obter todas consultas do usuario
router.post('/consultas_do_usuario',consultasController.obterTodasConsultaPeloTokenUsuario)

//Rota para cadastrar especialidade
router.post('/editar_especialidade',consultasController.cadastrarEspecialidades)
//Rota para retornar todas as especialidades
router.post('/especialidades',consultasController.obterEspecialidades)
module.exports = router;