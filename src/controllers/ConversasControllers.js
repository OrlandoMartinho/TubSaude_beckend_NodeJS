const db = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const secretKey = require('../private/secretKey.json');
const data = require('../utils/converterData');
const token = require('../utils/token');

const conversasController = {
    // Criar uma nova conversa entre dois usuários ou médicos
    // Criar uma nova conversa entre um médico e um usuário
    criarConversa:async (req, res) => {
        try {
            const { accessTokenDoctor, accessToken } = req.body;
    
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessTokenDoctor)
    
            if (!userId || !doctorId) {
                console.error('Erro ao obter IDs do usuário e do médico');
                res.status(200).json({ error: 'Erro ao criar conversa: IDs de usuário e médico não encontrados' });
                return;
            }

            if( !(await token.verificarTokenUsuario(accessToken)) || !(await token.verificarTokenMedico(accessTokenDoctor))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }
    
            // Verificar se já existe uma conversa entre o usuário e o médico
            const verificarConversaQuery = `SELECT id_conversa FROM conversas WHERE (id_usuario = ? AND id_medico = ?) OR (id_usuario = ? AND id_medico = ?)`;
            db.query(verificarConversaQuery, [userId, doctorId, doctorId, userId], (err, result) => {
                if (err) {
                    console.error('Erro ao verificar a existência da conversa:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao verificar a existência da conversa' });
                    return;
                }
                
                if (result.length > 0) {
                    // Já existe uma conversa entre o usuário e o médico
                    console.log('Já existe uma conversa entre o usuário e o médico');
                    res.status(200).json({ message: 'Já existe uma conversa entre o usuário e o médico' });
                } else {
                    // Criar uma nova conversa
                    const criarConversaQuery = `INSERT INTO conversas (id_usuario, id_medico) VALUES (?, ?)`;
                    db.query(criarConversaQuery, [userId, doctorId], (err, result) => {
                        if (err) {
                            console.error('Erro ao criar a conversa:', err.message);
                            res.status(500).json({ error: 'Erro interno do servidor ao criar conversa' });
                            return;
                        }
                        const conversaId = result.insertId;
                        console.log('Nova conversa criada com sucesso');
                        res.status(200).json({ message: 'Conversa criada com sucesso', conversaId });
                    });
                }
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao criar conversa' });
        }
    }
    , // Listar conversas de um usuário ou médico
    listarConversas:async (req, res) => {
        try {
            const { accessToken } = req.body;
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);

            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                res.status(200).json({ error: 'Erro ao listar conversas: ID do usuário ou médico não encontrado' });
                return;
            }

            if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }

            const id = userId || doctorId;

            let listarConversasQuery = '';
            if (userId) {
                // Se o token for do usuário, listar conversas com médicos
                listarConversasQuery = `
                    SELECT * FROM conversas where id_usuario=${userId}
                `;
            } else {
                // Se o token for do médico, listar conversas com usuários
                listarConversasQuery = `
                SELECT * FROM conversas where id_usuario=${doctorId}
                `;
            }

            db.query(listarConversasQuery, [id], (err, result) => {
                if (err) {
                    console.error('Erro ao listar conversas:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao listar conversas' });
                    return;
                }
                res.status(200).json({ conversas: result });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao listar conversas' });
        }
    },
    eliminarConversa: async (req, res) => {
        try {
            const { accessToken, conversaId } = req.body;

            const userId = token.usuarioId(accessToken);
            const medicoId = token.medicoId(accessToken);

            if (!userId && !medicoId) {
                console.error('Erro ao obter ID do usuário ou médico');
                res.status(400).json({ error: 'Erro ao obter ID do usuário ou médico do token' });
                return;
            }

            if( !(await token.verificarTokenUsuario(accessTokenUser)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }

            let id;

            if (userId) {
                id = userId;
            } else {
                id = medicoId;
            }

            const verificarConversaQuery = `SELECT id_conversa FROM conversas WHERE id_conversa = ? AND (id_usuario = ? OR id_medico = ?)`;
            db.query(verificarConversaQuery, [conversaId, id, id], (err, result) => {
                if (err) {
                    console.error('Erro ao verificar a conversa:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao verificar a conversa' });
                    return;
                }

                if (result.length === 0) {
                    console.error('Conversa não encontrada ou não relacionada ao usuário ou médico');
                    res.status(404).json({ error: 'Conversa não encontrada ou não relacionada ao usuário ou médico' });
                    return;
                }

                const eliminarConversaQuery = `DELETE FROM conversas WHERE id_conversa = ?`;
                db.query(eliminarConversaQuery, [conversaId], (err, result) => {
                    if (err) {
                        console.error('Erro ao eliminar conversa:', err.message);
                        res.status(500).json({ error: 'Erro interno do servidor ao eliminar conversa' });
                        return;
                    }

                    console.log('Conversa eliminada com sucesso');
                    res.status(200).json({ message: 'Conversa eliminada com sucesso' });
                });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao eliminar conversa' });
        }
    }



};

module.exports = conversasController;
