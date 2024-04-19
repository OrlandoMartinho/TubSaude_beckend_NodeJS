const db = require('../config/dbConfig');
const data = require('../utils/converterData');
const token = require('../utils/token');

const notificacoesController = {
    // Adiciona uma notificação para um médico ou usuário com base no accessToken fornecido
    addNotificacao:async (accessTokenDoctor, notificacao,accessTokenUser) => {
        try {
            // Obtém o ID do médico a partir do token
            const id_medico = token.medicoId(accessTokenDoctor);
            // Obtém o ID do usuário a partir do token
            const id_usuario = token.usuarioId(accessTokenUser);
            if( !(await token.verificarTokenUsuario(accessTokenUser)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }
          
            // Verifica se o token pertence a um usuário ou médico
            if (id_usuario) {
                // Se o token pertencer a um usuário, insere a notificação associando-a ao usuário
              
                const inserirNotificacao = `INSERT INTO notificacoes (descricao,data_da_notificacao ,id_usuario) VALUES (?, ?, ?)`;
                db.query(inserirNotificacao, [notificacao,data, id_usuario], (err, result) => {
                    if (err) {
                        console.error('Erro ao armazenar a notificação para o usuário:', err.message);
                        return;
                    }
                    console.log("Nova notificação adicionada para usuário com sucesso");
                });
            }

            if (id_medico) {
                // Se o token pertencer a um médico, insere a notificação associando-a ao médico
                const date = data.toString();
                const inserirNotificacao = `INSERT INTO notificacoes (descricao, data_da_notificacao, id_medico) VALUES (?, ?, ?)`;
                db.query(inserirNotificacao, [notificacao, date, id_medico], (err, result) => {
                    if (err) {
                        console.error('Erro ao armazenar a notificação para o médico:', err.message);
                        return;
                    }
                    console.log("Nova notificação adicionada para médico com sucesso");
                });
            }
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário:', error.message);
        }
    },

    // Obtém todas as notificações de um médico ou usuário com base no accessToken fornecido
    obterTodasNotificacoes: async (req, res) => {
        try {
            const { accessToken } = req.body;
            const id_medico = token.medicoId(accessToken);
            const id_usuario = token.usuarioId(accessToken);
 console.log(id_medico+"==="+id_usuario)
            // Verifica se o token é válido e se pertence a um médico ou usuário
            if (!id_medico && !id_usuario) {
                return res.status(200).json({ erro: 'Token inválido' });
            }
            if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }

            let query = '';
            if (id_medico) {
                // Se o token pertencer a um médico, busca todas as notificações associadas a ele
                query = 'SELECT * FROM notificacoes WHERE id_medico = ?';
            } else {
                // Se o token pertencer a um usuário, busca todas as notificações associadas a ele
                query = 'SELECT * FROM notificacoes WHERE id_usuario = ?';
            }

            db.query(query, [id_medico || id_usuario], (err, result) => {
                if (err) {
                    console.log('Erro ao buscar notificações:', err.message);
                    return res.status(500).json({ erro: 'Erro ao buscar notificações' });
                }
                console.log(id_medico,id_usuario);
                res.json({ notificacoes: result });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    // Marca uma notificação como lida com base no id_notificacao fornecido e no accessToken fornecido
    marcarNotificacaoComoLida: async (req, res) => {
        try {
            const { accessToken, id_notificacoes } = req.body;
            const id_medico = token.medicoId(accessToken);
            const id_usuario = token.usuarioId(accessToken);
            let status, estadoonline;
    
            // Verifica se o token é válido e se pertence a um médico ou usuário
            if (!id_medico && !id_usuario) {
                return res.status(200).json({ erro: 'Token inválido' });
            }

            if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }
           
            // Verifica se a notificação pertence ao usuário ou médico
            const obterNotificacaoQuery = 'SELECT * FROM notificacoes WHERE id_notificacoes = ?';
            db.query(obterNotificacaoQuery, [id_notificacoes], (err, result) => {
                if (err) {
                    return res.status(500).json({ mensagem: 'Erro ao obter notificação', erro: err });
                }
    
                // Se a notificação não for encontrada ou não pertencer ao usuário ou médico, retorne erro
                if (result.length === 0) {
                    return res.status(404).json({ mensagem: 'Notificação não encontrada ou não autorizada para este usuário ou médico' });
                }
    
                // Caso contrário, marque a notificação como lida
                const estado = result[0].lido;
                status = estado === 0 ? 1 : 0;
                estadoonline = estado === 0 ? "lido" : "Não lido";
    
                const editarNotificacaoQuery = 'UPDATE notificacoes SET lido = ? WHERE id_notificacoes = ?';
                db.query(editarNotificacaoQuery, [status, id_notificacoes], (err, result) => {
                    if (err) {
                        return res.status(500).json({ mensagem: 'Erro ao editar Notificação', erro: err });
                    }
                    // Retorne a mensagem de sucesso e o novo estado da notificação
                    res.json({ mensagem: 'Notificação marcada como lida com sucesso', Estado: estadoonline });
                });
            });
    
        } catch (error) {
            console.error('Erro ao decodificar o token:', error.message);
            res.status(500).json({ erro: error.message });
        }
    }
    
};

module.exports = notificacoesController;
