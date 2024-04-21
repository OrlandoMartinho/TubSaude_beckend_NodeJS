const db = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const secretKey = require('../private/secretKey.json');
const credenciaisAdm=require('../private/CredenciaisADM.json')
const token = require('../utils/token');



function criar(res,userId,nome_de_usuario)
{
      // Verificar se já existe uma conversa entre o usuário e o médico
      const verificarConversaQuery = `SELECT * FROM conversas WHERE id_usuario = ? `;
      db.query(verificarConversaQuery, [userId], (err, result) => {
          if (err) {
              console.error('Erro ao verificar a existência da conversa:', err.message);
              res.status(500).json({ error: 'Erro interno do servidor ao verificar a existência da conversa' });
              return;
          }
          
          if (result.length > 0) {
              res.status(400).json({ message: 'Já existe uma conversa com este usuário  com o id',id:result[0].id_conversa });
          } else {
              // Criar uma nova conversa
              const criarConversaQuery = `INSERT INTO conversas (id_usuario,nome_de_usuario) VALUES (?,?)`;
              db.query(criarConversaQuery, [userId,nome_de_usuario], (err, result) => {
                  if (err) {
                      console.error('Erro ao criar a conversa:', err.message);
                      res.status(500).json({ error: 'Erro interno do servidor ao criar conversa' });
                      return;
                  }
                  const conversaId = result.insertId;
                  console.log('Nova conversa criada com sucesso');
                  res.status(201).json({ message: 'Conversa criada com sucesso',"Id da conversa": conversaId });
              });
          }
      });
}
const conversasController = {
   
    criarConversa:async (req, res) => {
        try {
            const {  accessToken ,id_usuario} = req.body;
    
            
            const email = token.usuarioEmail(accessToken);
            const validarAdm=email===credenciaisAdm.email
            if (validarAdm ==false && !id_usuario) {
                console.error('Erro ao obter IDs do usuário e do médico');
                res.status(400).json({ error: 'Verifique bem os valores' });
                return;
            }

            let userId

            if(await token.verificarTokenUsuario(accessToken)==true){
               userId = token.usuarioId(accessToken);
            }

            if( !(await token.verificarTokenUsuario(accessToken)) && validarAdm == false){
                return res.status(401).json({ mensagem: 'Token inválido' });
            }

            var b
            var nome_de_usuario;

            if(token.usuarioNome(accessToken)&&token.usuarioId(accessToken)!=1){
              
                nome_de_usuario=token.usuarioNome(accessToken)
                criar(res,userId,nome_de_usuario)
            }else{
             console.log(id_usuario)
            db.query("SELECT * FROM usuarios WHERE id_usuario = ?",[id_usuario],(err,result)=>{

                    if(err){
                        console.log("Erro:"+err.message)
                        return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    }
                   
                        if(result.length===0){
                            return res.status(404).json({Mensagem:"Usuario não encontrado"})
                        }
                        nome_de_usuario=result[0].nome_de_usuario
                        criar(res,userId,nome_de_usuario)
                    
                })
            }

        
    
          
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao criar conversa' });
        }
    }
    , // Listar conversas de um usuário ou médico
    listarConversas:async (req, res) => {
        try {
            const {accessToken} = req.body

            const {email} = jwt.verify(accessToken, secretKey.secretKey);
    
            const selectQuery='SELECT * FROM usuarios WHERE email = ?'
    
            db.query(selectQuery,[email],async (err, result) => {
    
                if(err){
                    console.log("Erro:"+err.message)
                    return res.status(500).json({Mensagem:"Erro interno do servidor"})
                }
                if(result.length===0){
                    return res.status(401).json({Mensagem:"Token inválido"})
                }
        
                if(result[0].token!=accessToken){
                    return res.status(401).json({Mensagem:"Token inválido"})
                }
    
                const selectQuery2 = "SELECT * FROM conversas";
                db.query(selectQuery2,(erro,results)=>{
                    
                    if(erro){
                        console.log("Erro:"+err.message)
                        return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    }
                    return res.status(200).json({Conversas:results})
                })
            })
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao listar conversas' });
        }
    },
    eliminarConversa: async (req, res) => {

        try {
            const {accessToken,id_conversa} = req.body

            if(!accessToken||!id_conversa){
                return res.status(400).json({Mensagem:"Complete bem os campos"})
            }

            const id_usuario =token.usuarioId(accessToken)
            const email_user =token.usuarioEmail(accessToken)

            const {email} = jwt.verify(accessToken, secretKey.secretKey);
            if(!email||!email_user){

            }
            const selectQuery='SELECT * FROM usuarios WHERE email = ? OR email = ?'
    
            db.query(selectQuery,[email,email_user],async (err, result) => {
    
                if(err){
                    console.log("Erro:"+err.message)
                    return res.status(500).json({Mensagem:"Erro interno do servidor"})
                }
                console.log(email_user)
        
                if(result.length===0 && !await token.verificarTokenUsuario(accessToken)){
                    return res.status(401).json({Mensagem:"Token inválido"})
                }
        
                if(result[0].token!=accessToken && !await token.verificarTokenUsuario(accessToken)){
                    return res.status(401).json({Mensagem:"Token inválido"})
                }
    
            const verificarConversaQuery = `SELECT * FROM conversas WHERE id_conversa = ? OR id_usuario = ? `;
            db.query(verificarConversaQuery, [id_conversa,id_usuario], (err, result) => {
                if (err) {
                    console.error('Erro ao verificar a conversa:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao verificar a conversa' });
                    return;
                }

                if (result.length === 0) {
                    console.error('Conversa não encontrada ');
                    res.status(404).json({ error: 'Conversa não encontrada ou não relacionada ao usuário' });
                    return;
                }

                const eliminarConversaQuery = `DELETE FROM conversas WHERE id_conversa = ?`;
                db.query(eliminarConversaQuery, [id_conversa], (err, result) => {
                    if (err) {
                        console.error('Erro ao eliminar conversa:', err.message);
                        res.status(500).json({ error: 'Erro interno do servidor ao eliminar conversa' });
                        return;
                    }

                    console.log('Conversa eliminada com sucesso');
                    res.status(200).json({ message: 'Conversa eliminada com sucesso' });
                });
            });
            })
        } catch (error) {
            console.error('Erro ao eliminar conversa:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }


      
    }



};

module.exports = conversasController;
