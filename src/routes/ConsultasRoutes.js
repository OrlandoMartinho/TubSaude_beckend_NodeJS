const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/ConsultasControllers');

// Rota para marcar uma consulta
router.post('/', consultasController.cadastrarConsulta);

// Rota para concluir uma consulta
router.post('/confirmar_consulta', consultasController.addMedicoNaConsulta);

// Rota para excluir uma consulta 
router.delete('/', consultasController.eliminarConsultaPeloIdAcessToken);

// Rota para obter todas consultas do medico
router.post('/consultas_do_medico', consultasController.obterTodasConsultaPeloTokenMedico);

//Rota para obter todas consultas do usuario
router.post('/consultas_do_usuario',consultasController.obterTodasConsultaPeloTokenUsuario)

module.exports = router;