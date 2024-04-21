const db = require('../config/dbConfig');
const data = require('../utils/converterData');
const token = require('../utils/token');

const notificacoesController = {
    // Adiciona uma notificação para um médico ou usuário com base no accessToken fornecido
    addNotificacao:async (notificacao) => {
        try {
          
                const inserirNotificacao = `INSERT INTO notificacoes (conteudo) VALUES (?)`;
                db.query(inserirNotificacao, [notificacao], (err, result) => {
                    if (err) {
                        console.error('Erro ao armazenar a notificação para o usuário:', err.message);
                        return;
                    }
                    console.log("Nova notificação adicionada com sucesso");
                });
             
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário:', error.message);
        }
    },
    // Obtém todas as notificações de um médico ou usuário com base no accessToken fornecido
    obterTodasNotificacoes: async (req, res) => {

        const {accessToken} = req.body

        const email = token.usuarioEmail(accessToken)

        const selectQuery='SELECT token FROM usuarios WHERE email = ?'
      
        db.query(selectQuery,[email],async (err, result) => {

            if(err){
                console.log("Erro:"+err.message)
                return res.status(500).json({Mensagem:"Erro interno do servidor"})
            }
    
            if(result[0].token!=accessToken){
                return res.status(401).json({Mensagem:"Token inválido"})
            }

            const selectQuery2 = "SELECT * FROM notificacoes";
            db.query(selectQuery2,(err,result)=>{
                
                if(err){
                    console.log("Erro:"+err.message)
                    return res.status(500).json({Mensagem:"Erro interno do servidor"})
                }
                return res.status(200).json({Notificacoes:result})
            })
        })
    },
    // Marca uma notificação como lida com base no id_notificacao fornecido e no accessToken fornecido
    marcarNotificacaoComoLida: async (req, res) => {
        const {accessToken,id_notificacao} = req.body

        const {email} = jwt.verify(accessToken, secretKey.secretKey);

        const selectQuery='SELECT token FROM usuarios WHERE email = ?'

        db.query(selectQuery,[email],async (err, result) => {

            if(err){
                console.log("Erro:"+err.message)
                return res.status(500).json({Mensagem:"Erro interno do servidor"})
            }
    
            if(result[0].token!=accessToken){
                return res.status(401).json({Mensagem:"Token inválido"})
            }

            const selectQuery2 = "SELECT * FROM notificacoes where id_notificacao = ?";
            db.query(selectQuery2,id_notificacao,(err,result)=>{
                
                if(err){
                    console.log("Erro:"+err.message)
                    return res.status(500).json({Mensagem:"Erro interno do servidor"})
                }

                if (result.length === 0) {
                    return res.status(404).json({ mensagem: 'Notificação não encontrada ou não autorizada para este usuário ou médico' });
                }





            })
        })

           
            // Verifica se a notificação pertence ao usuário ou médico
            const obterNotificacaoQuery = 'SELECT * FROM notificacoes WHERE id_notificacoes = ?';
            db.query(obterNotificacaoQuery, [id_notificacoes], (err, result) => {
                if (err) {
                    return res.status(500).json({ mensagem: 'Erro ao obter notificação', erro: err });
                }
    
                const estado = result[0].visualizado;
                let status = estado === 0 ? 1 : 0;
                estadoonline = estado === 0 ? "lido" : "Não lido";
    
                const editarNotificacaoQuery = 'UPDATE notificacoes SET lido = ? WHERE id_notificacao = ?';
                db.query(editarNotificacaoQuery, [status, id_notificacao], (err, result) => {
                    if (err) {
                        return res.status(500).json({ mensagem: 'Erro ao editar Notificação', erro: err });
                    }
                    // Retorne a mensagem de sucesso e o novo estado da notificação
                return res.json({ mensagem: 'Notificação marcada com sucesso', Estado: estadoonline });
                
            });
                
            });
    
                                                                                           
    }
    
};

module.exports = notificacoesController;
