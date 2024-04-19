const db = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const secretKey=require('../private/secretKey.json');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


const AdmController = {
//Funsão para registrar o Adm
    autenticarAdm: async (req,res) => {
        try {

            const {senha,email} = req.body
            
            const selectQuery='SELECT * FROM usuarios where email = ?'

            db.query(selectQuery,[email,senha],async (err,result)=>{

                if(err){

                    console.log("Erro"+err)

                    res.status(500).json({Mensagem:"Erro interno do servidor"})

                }

                if(result.length===0){
                    res.status(401).json({Mensagem:"Credenciais inválidas"})
                }else{
                    const usuario = result[0]

                
                  if(await bcrypt.compareSync(senha, usuario.senha)){

                    const accessToken = jwt.sign({ id_usuario: usuario.id_usuario, email: usuario.email,senha:usuario.senha }, secretKey.secretKey);

                    const updateQuery = 'UPDATE usuarios SET token = ? WHERE id_usuario = ?';

                    // Parâmetros para a consulta SQL
                    const params = [accessToken,usuario.id_usuario];
                
                    // Executar a consulta SQL
                    db.query(updateQuery, params, (err, result) => {
                        if (err) {
                            console.error('Erro ao atualizar usuário:', err);
                            return res.status(500).json({ Mensagem: "Erro interno do servidor" });   
                        }

                        return res.status(201).json({ Mensagem: "Autenticação bem-sucedida", accessToken });   

                    
                    });
                  }else{
                    res.status(401).json({Mensagem:"Passe Inválida"})
                  }
                    
                }

            })


        } catch (error) {
            return res.status(500).json({ mensagem: `Erro interno do servidor: ${error.message}` });
        }
        
        
        
    }
  
}


module.exports = AdmController;
