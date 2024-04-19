const db = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = require('../private/secretKey.json');
const token = require('../utils/token');
const validarEmail = require('../utils/verificarEmail')
const gerarCodigoDeVerificacao=require('../utils/gerarcodigoDeVerificacao')
const enviarEmail = require('../utils/enviarEmail')
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const { parse, format } = require('date-fns');


const UsersController = {

    receberCodigo: async (req, res) => {
        const { email } = req.body;
    
        // Verifica se o email foi fornecido
        if (!email) {
            return res.status(400).json({ mensagem: 'O email é obrigatório' });
        }
        if(!(await validarEmail(email)).valido){
            return res.status(400).json({ mensagem: 'Email invalido',Motivo:(await validarEmail(email)).motivo});
        }
                // Se o email não está em uso, gera um novo código de verificação e insere na base de dados
                const codigoDeVerificacao = gerarCodigoDeVerificacao();
                const insertCodeQuery = 'INSERT INTO codigos_verificacao (email, codigo, utilizado) VALUES (?, ?, ?)';
                db.query(insertCodeQuery, [email, codigoDeVerificacao, 0], (err) => {
                    if (err) {
                        return res.status(500).json({ mensagem: 'Erro ao armazenar o código de verificação: ' + err });
                    }
                    enviarEmail(email, codigoDeVerificacao)
                        .then(() => {
                            return res.status(200).json({ mensagem: 'Email de verificação enviado com sucesso' });
                        })
                        .catch(error => {
                            console.log("Erro :"+error)
                            return res.status(500).json({ mensagem: 'Erro interno do servidor'});
                        });
                });
            
        
    },
    // Método para autenticar usuário com o código de verificação
    cadastrarUsuario: async (req, res) => {
        const { email, codigo,nome, senha, genero,data_de_nascimento  } = req.body;

        // Verificar se todos os campos obrigatórios estão presentes
        if (!nome || !senha || !genero || !email || !data_de_nascimento || !codigo) {
            return res.status(400).json({ Mensagem: "Campos incompletos" });
        }
        const dateObj = parse(data_de_nascimento, 'd-MM-yyyy', new Date());

        const formattedDate = format(dateObj, 'yyyy-MM-dd');

        const selectCodeQuery = 'SELECT * FROM codigos_verificacao WHERE email = ? AND codigo = ? AND utilizado = 0';
        db.query(selectCodeQuery, [email, codigo], async (err, results) => {
            if (err) {
                console.log("Erro :"+err.message)
                return res.status(500).json({ mensagem: 'Erro interno do servidor'});
             }
            if (results.length === 0) {
                return res.status(400).json({ mensagem: 'Código de verificação inválido ou já utilizado' });
            }
            // Marca o código de verificação como utilizado
            const updateCodeQuery = 'UPDATE codigos_verificacao SET utilizado = 1 WHERE email = ? AND codigo = ?';
            db.query(updateCodeQuery, [email, codigo],async (err) => {
                if (err) {
                    console.log("Erro :"+err.message)
                    return res.status(500).json({ mensagem: 'Erro interno do servidor'});
                }
                const selectQuery='SELECT * FROM  usuarios  WHERE  email = ?'

                db.query(selectQuery,[email],async (err,result)=>{

                    if(err){
                        console.log("Erro:"+err.message)
                    return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    }

                    if(result.length>0){
                       return res.status(403).json({Mensagem:"Usuário já estava cadastrado"}) 
                    }

                    try {
                        // Encriptar a senha com `bcrypt`
                
                        const senhaEncriptada = await bcrypt.hashSync(senha, salt);
                        // Inserir o novo usuário na tabela `usuarios`
                        const createQuery = "INSERT INTO usuarios (nome, senha, genero, email, data_de_nascimento) VALUES (?, ?, ?, ?, ?)";
                        
                        db.query(createQuery,[nome, senhaEncriptada, genero,email,formattedDate],()=>{

                            if(err){
                                console.log("Erro :"+err)
                                res.status(500).json({Mensagem:"Erro interno do servidor"})
                            }

                            return res.status(200).json({ Mensagem: "Usuário cadastrado com sucesso"});

                        })
                    } catch (err) {
                        console.error({ Erro: err });
                        return res.status(500).json({ Mensagem: "Erro interno do servidor", erro: err });
                    }
                })
                    })
                    
            });

    },
    //Função para autenticar usuário 
    autenticarUsuario: async (req, res) => {
        const { email, senha } = req.body;

        // Verificar se todos os campos obrigatórios estão presentes
        if (!email || !senha) {
            return res.status(403).json({ Mensagem: "Campos incompletos" });
        }

     
            // Consultar o usuário com o email fornecido
            const selectQuery = "SELECT * FROM usuarios WHERE email = ?";
            db.query(selectQuery, [email],async (err,result)=>{

            if(err){
                console.log(err)
                return res.status(500).json({ Mensagem: "Erro interno do servidor" });
            }

            if(result.length===0){
                return res.status(403).json({ Mensagem: "Usuário não cadastrado" });
            }

            try {

                const usuario =result[0];
                // Comparar a senha fornecida com a senha encriptada armazenada
               const isPasswordValid = await bcrypt.compareSync(senha, usuario.senha);

               
                    if (!isPasswordValid) {
                        return res.status(401).json({ Mensagem: "Senha incorreta" });
                    } else {
                    // Gerar token JWT para o usuário autenticado
                    const accessToken = jwt.sign({ id: usuario.id_usuario, email: usuario.email,senha:usuario.senha }, secretKey.secretKey);
                    
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


                   
                    }
                
            
    

            } catch (err) {
                console.log({ Erro: err });
                return res.status(500).json({ Mensagem: "Erro interno do servidor"});
            }


           });


          
    }
    ,
    receberCodigoNovo: async (req, res) => {
        const { novo_email, accessToken } = req.body;
    
        try {
            // Verifica se o novo_email foi fornecido
            if (!novo_email) {
                return res.status(400).json({ mensagem: 'O novo_email é obrigatório' });
            }
    
            // Verifica o token do usuário
            const tokenValido = await token.verificarTokenUsuario(accessToken);
            if (!tokenValido) {
                return res.status(401).json({ mensagem: 'Token inválido' });
            }
    
            // Valida o novo email
            const emailValidacao = await validarEmail(novo_email);
            if (!emailValidacao.valido) {
                return res.status(400).json({ mensagem: 'Email inválido', motivo: emailValidacao.motivo });
            }
    
            // Verifica se o email já está em uso
            const selectQuery = "SELECT * FROM usuarios where email = ?";
             db.query(selectQuery, [novo_email],async (err,result)=>{

                if(err){
                    console.log('Erro:'+err)
                    return res.status(500).json({Mensagem:"Erro interno no servidor"})
                }
            
                if (result.length > 0) {
                    return res.status(403).json({ mensagem: 'Email já está em uso no sistema' });
                }else{
                  // Gera um novo código de verificação e insere na base de dados
                 const codigoDeVerificacao = gerarCodigoDeVerificacao();
                 const insertCodeQuery = 'INSERT INTO codigos_verificacao (email, codigo, utilizado) VALUES (?, ?, ?)';
                 await db.query(insertCodeQuery, [novo_email, codigoDeVerificacao, 0]);
    
                  // Envia email de verificação
                const valor= await enviarEmail(novo_email, codigoDeVerificacao,res);
                if(valor){
                    return res.status(200).json({ mensagem: 'Email de verificação enviado com sucesso' });
                }else{

                    return res.status(400).json({ mensagem: 'Verifique a sua internet ou seu email não está disponível' });
                
                }
                }

             });



           
    
          
    
        } catch (error) {
            console.log("Erro aqui: " + error);
            return res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    }
    ,
    //Funsão para editar Usuário
    editarUsuario:async(req,res)=>{

        const {accessToken,codigo,nome, senha, genero, email, data_de_nascimento } = req.body;
    
        const tokenValido = await token.verificarTokenUsuario(accessToken);
        if (!tokenValido) {
            return res.status(401).json({ mensagem: 'Token inválido' });
        }
        // Verificar se todos os campos obrigatórios estão presentes
        if (!nome || !senha || !genero || !email || !data_de_nascimento) {
            return res.status(400).json({ Mensagem: "Campos incompletos" });
        }

        const selectCodeQuery = 'SELECT * FROM codigos_verificacao WHERE email = ? AND codigo = ? AND utilizado = 0';
        db.query(selectCodeQuery, [email, codigo], async (err, results) => {
            if (err) {
                console.log("Erro :"+err.message)
                return res.status(500).json({ mensagem: 'Erro interno do servidor'});
             }
            if (results.length === 0) {
                return res.status(400).json({ mensagem: 'Código de verificação inválido ou já utilizado' });
            }
            const dateObj = parse(data_de_nascimento, 'd-MM-yyyy', new Date());

            const formattedDate = format(dateObj, 'yyyy-MM-dd');
    
            // Marca o código de verificação como utilizado
            const updateCodeQuery = 'UPDATE codigos_verificacao SET utilizado = 1 WHERE email = ? AND codigo = ?';
            db.query(updateCodeQuery, [email, codigo],async (err) => {
                if (err) {
                    console.log("Erro :"+err.message)
                    return res.status(500).json({ mensagem: 'Erro interno do servidor'});
                }

                    try {
                        // Encriptar a senha com `bcrypt`
                
                        const senhaEncriptada = await bcrypt.hashSync(senha, salt);
                        // Inserir o novo usuário na tabela `usuarios`
                        const updateQuery = 'UPDATE usuarios SET nome=?, senha=?, genero=?, email=?, data_de_nascimento=? WHERE token = ?';
                        db.query(updateQuery,[nome,senhaEncriptada, genero, email,formattedDate,accessToken],(err,result)=>{
                
                            if(err){
                                console.log("Erro:"+err)
                            }
                
                            if(result.length===0){
                
                                return res.status(401).json({ Mensagem: "Token inválidos" });
                
                            }else{
                
                
                                   const accessToken2 = jwt.sign({ id: token.usuarioId(accessToken), email:token.usuarioEmail(accessToken),senha:token.usuarioSenha(accessToken) }, secretKey.secretKey);
                                    
                                    const updateQuery = 'UPDATE usuarios SET token = ? WHERE id_usuario = ?';
                
                                    // Parâmetros para a consulta SQL
                                    const params = [accessToken2, token.usuarioId(accessToken)];
                                
                                    // Executar a consulta SQL
                                    db.query(updateQuery, params, (err, result) => {
                                        if (err) {
                                            console.error('Erro ao atualizar usuário:', err);
                                            return res.status(500).json({ Mensagem: "Erro interno do servidor" });   
                                        }
                
                                        return res.status(201).json({ Mensagem: "Edição bem sucedida", Novo_token:accessToken2 });   
                
                                    
                                    });
                
                
                
                            }
                
                
                        })
                        

                 
                    } catch (err) {
                        console.error({ Erro: err });
                        return res.status(500).json({ Mensagem: "Erro interno do servidor", erro: err });
                    }

                })


               

    
            
                    })
                    
            









       
      

    }
    ,
    obterTodosUsuarios:async(req,res)=>{

        const {accessToken} = req.body

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

            const selectQuery2 = "SELECT * FROM usuarios";
            db.query(selectQuery2,(err,result)=>{
                
                if(err){
                    console.log("Erro:"+err.message)
                    return res.status(500).json({Mensagem:"Erro interno do servidor"})
                }
                return res.status(200).json({Usuarios:result})
            })
        })


        


    },
    eliminarUsuario: async (req, res) => {
        try {
            const { accessToken } = req.body;
            const id_usuario = await token.usuarioId(accessToken);
    
            // Verifica se o ID do usuário é válido
            if (!id_usuario || !(await token.verificarTokenUsuario(accessToken))) {
                return res.status(401).json({ mensagem: 'Token inválido' });
            }
    
            // Query para eliminar o usuário da tabela usuarios
            const deleteUsuarioQuery = 'DELETE FROM usuarios WHERE id_usuario = ?';
    
            // Executa a query para eliminar o usuário
            db.query(deleteUsuarioQuery, [id_usuario], (err, result) => {
                if (err) {
                    console.error('Erro ao eliminar usuário:', err);
                    return res.status(500).json({ mensagem: 'Erro ao eliminar usuário', erro: err });
                }
    
                // Verifica se o usuário foi eliminado com sucesso
                if (result.affectedRows === 0) {
                    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
                }
              const email=token.usuarioEmail(accessToken)
              console.log(email)
                db.query('DELETE FROM codigos_verificacao where email =  ?',[email],(err,result)=>{
                    if(err){
                        console.log('Erro'+err)
                        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
                    }
                })
                res.json({ mensagem: 'Usuário eliminado com sucesso' });
            });
        } catch (err) {
            console.error('Erro ao eliminar usuário:', err);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao eliminar usuário' });
        }
    },
    obterUsuarioPorAccessToken: async (req, res) => {
        const { accessToken } = req.body;
        if (!accessToken || await (token.verificarTokenUsuario(accessToken)) ) {
            return res.status(401).json({ mensagem: 'Token inválido' });
        }
        const selectQuery = 'SELECT * FROM usuarios WHERE accessToken = ?';
        db.query(selectQuery, [accessToken], (err, results) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao obter o usuário' });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ mensagem: 'Usuário não encontrado' });
                return;
            }
            const usuario = results[0]; // Assumindo que o accessToken é único, pegamos apenas o primeiro resultado
          return  res.status(200).json({ usuario:usuario });
        });
    }

};

module.exports = UsersController;
