const db = require('../config/dbConfig');
const token = require('../utils/token');
const notify = require('../controllers/NotificacoesController');

const ConsultasController = {


    








    // Método para cadastrar uma nova consulta
    cadastrarConsulta: async (req, res) => {
        const { nome_do_paciente, genero, data_de_nascimento, accessToken ,descricao} = req.body;
        const id_usuario = token.usuarioId(accessToken);
        if (!id_usuario || !(await token.verificarTokenUsuario(accessToken))) {
            return res.status(403).json({ mensagem: 'Token inválido' });
        }
    
        const insertConsulta = 'INSERT INTO Consultas (nome_do_paciente, genero, data_de_nascimento,descricao, id_usuario) VALUES (?, ?, ?, ?,?)';
    
        db.query(insertConsulta, [nome_do_paciente, genero, data_de_nascimento, id_usuario], (err, result) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro interno do servidor' });
            }
    
            res.status(200).json({ mensagem: 'Consulta adicionada com sucesso' });
        });    
    },
    // Método para adicionar um médico à consulta
    addMedicoNaConsulta: async (req, res) => {
        const { data_de_marcacao, nome_do_medico, accessToken, id_consulta, accessTokenUser } = req.body;
        const id_medico = token.medicoId(accessToken);
        const id_usuario = token.usuarioId(accessTokenUser);
        
        if (!id_medico || !id_usuario) {
            return res.status(403).json({ mensagem: 'Tokens inválidos' });
        }

        if( !(await token.verificarTokenUsuario(accessTokenUser)) || !(await token.verificarTokenMedico(accessToken))){
            return res.status(200).json({ mensagem: 'Tokens inválidos' });
        }
    
        // Verifica se a consulta existe antes de atualizá-la
        const consultaExistente = await new Promise((resolve, reject) => {
            const consultaQuery = 'SELECT * FROM Consultas WHERE id_consulta = ?';
            db.query(consultaQuery, [id_consulta], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.length > 0);
                }
            });
        });
    
        if (!consultaExistente) {
            return res.status(404).json({ mensagem: 'Consulta não encontrada' });
        }
    
        const updateConsulta = 'UPDATE Consultas SET data_de_marcacao = ?, nome_do_medico = ?, id_medico = ?, agendado = ? WHERE id_consulta = ?';
    
        db.query(updateConsulta, [data_de_marcacao, nome_do_medico, id_medico, 1, id_consulta], (err, result) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro interno do servidor' });
            }
            
            const notificacao = "A sua consulta foi marcada para " + data_de_marcacao;
           notify.addNotificacao(accessToken, notificacao, accessTokenUser); 
            console.log(result)
            res.json({ mensagem: 'Consulta agendada com sucesso' });
        });    
    }
    ,
    // Método para eliminar consulta pelo ID do usuário ou médico
    eliminarConsultaPeloIdAcessToken: async (req, res) => {
        const { accessToken ,id_consulta} = req.body;
        const id_usuario = token.usuarioId(accessToken);
        const id_medico = token.medicoId(accessToken);
        
        if (!id_medico || !id_usuario ) {
            return res.status(403).json({ mensagem: 'Tokens inválidos' });
        }


        if(!(await token.verificarTokenUsuario(accessToken)) || !(await token.verificarTokenMedico(accessToken))){
            return res.status(200).json({ mensagem: 'Tokens inválidos' });
        }


        
        let deleteConsulta;
        if (id_medico) {
            deleteConsulta = 'DELETE FROM Consultas WHERE id_medico = ?';
        } else if (id_usuario) {
            deleteConsulta = 'DELETE FROM Consultas WHERE id_consulta = ?'; // Corrigido: id_consulta ao invés de id_usuario
        }
        
        db.query(deleteConsulta, [id_consulta], (err) => { // Corrigido: passando id_consulta ao invés de id_consulta || id_consulta
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao eliminar consulta', erro: err });
            }
            const notificacao = "A sua consulta foi cancelada ";
            await (notify.addNotificacao(accessToken, notificacao, accessTokenUser)); 
            res.status(200).json({ mensagem: 'Consulta eliminada com sucesso' });
        });
    },
    // Método para obter todas as consultas de um usuário
    obterTodasConsultaPeloTokenUsuario: async (req, res) => {
        const { accessToken } = req.body;
        const id_usuario = token.usuarioId(accessToken);

        if (!id_usuario || ! await token.verificarTokenUsuario(accessToken)) {
            return res.status(200).json({ mensagem: 'Token inválido' });
        }

        const selectQuery = 'SELECT * FROM Consultas WHERE id_usuario = ?';
        db.query(selectQuery, id_usuario, (err, result) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao obter consultas" });
            }

            if (result.length > 0) {
                res.status(200).json({ Consultas: result });
            } else {
                res.status(200).json({ Mensagem: "Sem consultas para este usuário" });
            }
        });
    },
    // Método para obter todas as consultas de um médico
    obterTodasConsultaPeloTokenMedico: async (req, res) => {
        const { accessToken } = req.body;
        const id_medico = token.medicoId(accessToken);

        if (!id_medico|| !await token.verificarTokenMedico(accessToken)) {
            return res.status(200).json({ mensagem: 'Token inválido' });
        }

        const selectQuery = 'SELECT * FROM Consultas WHERE id_medico = ?';
        db.query(selectQuery, id_medico, (err, result) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao obter consultas" });
            }

            if (result.length > 0) {
                res.status(200).json({ Consultas: result });
            } else {
                res.status(200).json({ Mensagem: "Sem consultas para este médico" });
            }
        });
    }
};

module.exports = ConsultasController;
