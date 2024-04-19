const db = require('../config/dbConfig');
const  processarMensagemIA = require('../utils/iaUtils'); // Função para processar mensagens da IA
const token=require('../utils/token')
const MensagemIAController = {
    enviarMensagemIA: async (req, res) => {
        const { mensagem, accessToken } = req.body;

        // Verificar se a mensagem e o token de acesso foram fornecidos
        if (!mensagem || !accessToken) {
            res.status(400).json({ mensagem: 'A mensagem e o token de acesso são obrigatórios' });
            return;
        }

        // Obter o ID do usuário a partir do token de acesso
        const id_usuario = token.usuarioId(accessToken);

        // Verificar se o token de acesso é válido e se o ID do usuário é válido
        if (!id_usuario) {
            res.status(401).json({ mensagem: 'Token de acesso inválido' });
            return;
        }

        // Processar a mensagem da IA e obter a resposta
        const resposta =await processarMensagemIA(mensagem);

        const insertQuery = 'INSERT INTO mensagens_ia (mensagem, id_usuario, resposta) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [mensagem, id_usuario, resposta], (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao enviar mensagem para a IA' });
                return;
            }
            res.status(200).json({ mensagem: 'Mensagem enviada para a IA com sucesso' });
        });
    },

    obterMensagensIA: async (req, res) => {
        const accessToken = req.body.accessToken;

        // Verificar se o token de acesso foi fornecido
        if (!accessToken) {
            res.status(400).json({ mensagem: 'Token de acesso não fornecido' });
            return;
        }

        // Obter o ID do usuário a partir do token de acesso
        const id_usuario = token.usuarioId(accessToken);

        // Verificar se o token de acesso é válido e se o ID do usuário é válido
        if (!id_usuario) {
            res.status(401).json({ mensagem: 'Token de acesso inválido' });
            return;
        }

        const selectQuery = 'SELECT * FROM mensagens_ia WHERE id_usuario = ? ORDER BY dataHoraEnvio ASC'; // Ordena as mensagens por data e hora de envio
        db.query(selectQuery, [id_usuario], (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao obter mensagens da IA' });
                return;
            }
            res.status(200).json(result);
        });
    },

    obterMensagemIA: async (req, res) => {
        const {accessToken,id_mensagem_ia}=req.body
        

        // Verificar se o token de acesso e o ID da mensagem foram fornecidos
        if (!accessToken || !id_mensagem_ia) {
            res.status(400).json({ mensagem: 'O token de acesso e o ID da mensagem são obrigatórios' });
            return;
        }

        // Obter o ID do usuário a partir do token de acesso
        const id_usuario = token.usuarioId(accessToken);

        // Verificar se o token de acesso é válido e se o ID do usuário é válido
        if (!id_usuario) {
            res.status(401).json({ mensagem: 'Token de acesso inválido' });
            return;
        }

        const selectQuery = 'SELECT * FROM mensagens_ia WHERE id_mensagem_ia = ? AND id_usuario = ?';
        db.query(selectQuery, [id_mensagem_ia, id_usuario], (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao obter mensagem da IA' });
                return;
            }
            res.status(200).json(result);
        });
    },

    apagarMensagemIA: async (req, res) => {
        const accessToken = req.body.accessToken;
        const id_mensagem_ia = req.body.id_mensagem_ia;

        // Verificar se o token de acesso e o ID da mensagem foram fornecidos
        if (!accessToken || !id_mensagem_ia) {
            res.status(400).json({ mensagem: 'O token de acesso e o ID da mensagem são obrigatórios' });
            return;
        }

        // Obter o ID do usuário a partir do token de acesso
        const id_usuario = token.usuarioId(accessToken);

        // Verificar se o token de acesso é válido e se o ID do usuário é válido
        if (!id_usuario) {
            res.status(401).json({ mensagem: 'Token de acesso inválido' });
            return;
        }

        const deleteQuery = 'DELETE FROM mensagens_ia WHERE id_mensagem_ia = ? AND id_usuario = ?';
        db.query(deleteQuery, [id_mensagem_ia, id_usuario], (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao apagar mensagem da IA' });
                return;
            }
            res.status(200).json({ mensagem: 'Mensagem da IA apagada com sucesso' });
        });
    }
};


module.exports = MensagemIAController;
