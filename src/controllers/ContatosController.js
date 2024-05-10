const db = require('../config/dbConfig');
const token = require('../utils/token');
const notify = require('../controllers/NotificacoesController');
const  responderEmail=require('../utils/ResponderContacto')

const ContactosController = {

    // Método para cadastrar um novo contato
    cadastrarContacto: async (req, res) => {
        const { mensagem, email } = req.body;
     
        if(!mensagem||!email){
            return res.status(400).json({Mensagem:"Verifique os campos e tente novamente"})
        }

        const insertContacto = 'INSERT INTO contatos ( email,mensagem) VALUES ( ?, ?)';

        db.query(insertContacto, [email,mensagem], (err, result) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro interno do servidor' });
            }
            const notificacao = "Novo contacto recebido do email "+email;
            notify.addNotificacao(notificacao);   
            res.status(200).json({ mensagem: 'Contacto adicionado com sucesso' });
        });
    },

    // Método para listar todos os contatos de um usuário
    listarContactos: async (req, res) => {
        const { accessToken } = req.body;
        const id_usuario = token.usuarioId(accessToken);

        if (id_usuario!=1||!id_usuario || !(await token.verificarTokenUsuario(accessToken))) {
            return res.status(401).json({ mensagem: 'Tokens inválidos' });
        }

        const selectQuery = 'SELECT * FROM contatos ';
        db.query(selectQuery, (err, result) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao obter contatos" });
            }

            if (result.length > 0) {
                return res.status(200).json({ Contactos: result });
            } else {
                return res.status(404).json({ Mensagem: "Sem contatos para este usuário" });
            }
        });
    },

    // Método para obter um contato por ID
    obterContactoPorId: async (req, res) => {
        const { accessToken, id_contato } = req.body;
        const id_usuario = token.usuarioId(accessToken);

        if (id_usuario!=1||!id_usuario || !(await token.verificarTokenUsuario(accessToken))) {
            return res.status(401).json({ mensagem: 'Tokens inválidos' });
        }

        const selectQuery = 'SELECT * FROM Contato WHERE id_contato = ?';
        db.query(selectQuery, [id_contato], (err, result) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao obter contato" });
            }

            if (result.length > 0) {
                return res.status(200).json({ Contacto: result });
            } else {
                return res.status(404).json({ Mensagem: "Contato não encontrado" });
            }
        });
    },

    // Método para eliminar um contato
    eliminarContactoPeloId: async (req, res) => {
        const { accessToken, id_contato } = req.body;
        const id_usuario = token.usuarioId(accessToken);

        if (id_usuario!=1||!id_usuario || !(await token.verificarTokenUsuario(accessToken))) {
            return res.status(401).json({ mensagem: 'Tokens inválidos' });
        }

        const deleteContacto = 'DELETE FROM Contactos WHERE id_contato = ? ';

        db.query(deleteContacto, [id_contato], (err, result) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao eliminar contato', erro: err });
            }

            if (result.affectedRows > 0) {
                return res.status(200).json({ mensagem: 'Contato eliminado com sucesso' });
            } else {
                return res.status(404).json({ Mensagem: "Contato não encontrado" });
            }
        });
    },
    responderUsuario:async (req,res)=>{

        const { accessToken, conteudo,email } = req.body;

        if(!await token.verificarTokenUsuario(accessToken)||token.usuarioNome(accessToken)!='administarador'){
           return res.status(401).json({Mensagem:"Token não autorizado"})
        }

        if(responderEmail(email,conteudo)){
            return res.status(200).json({Mensagem:"Contacto respondido com sucesso"})
        }else{
            return res.status(400).json({Mensagem:"Erro ao responder Mensagem"})
        }
    }

    
};

module.exports = ContactosController;
