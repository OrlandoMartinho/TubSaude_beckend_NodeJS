const db = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = require('../private/secretKey.json');
const token = require('../utils/token');
const validarEmail = require('../utils/verificarEmail')
const gerarCodigoDeVerificacao=require('../utils/gerarcodigoDeVerificacao')
const enviarEmail = require('../utils/enviarEmail')
const saltRounds = 10;
const multer=require('multer')
const fs=require('fs')
const path=require('path')
const salt = bcrypt.genSaltSync(saltRounds);
const { parse, format } = require('date-fns');
const notify = require('../controllers/NotificacoesController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 2048 * 2048 } 
}).single('foto'); 

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

        const formattedDate = format(dateObj, 'dd-MM-yyyy');

        const selectCodeQuery = 'SELECT * FROM codigos_verificacao WHERE email = ? AND codigo = ? AND utilizado = 0';
        db.query(selectCodeQuery, [email, codigo], async (err, results) => {
            if (err) {
                console.log("Erro :"+err.message)
                return res.status(500).json({ mensagem: 'Erro interno do servidor '});
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
                //Verifica se o email já está em uso
                db.query(selectQuery,[email],async (err,result)=>{

                    if(err){
                        console.log(" Erro:"+err.message)
                        return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    } 

                    if(result.length>0){
                       return res.status(403).json({Mensagem:"Usuário já está cadastrado"}) 
                    }

                    try {
                        // Encriptar a senha com `bcrypt`
                
                        const senhaEncriptada = await bcrypt.hashSync(senha, salt);

                        //Criar nome de usuário
                        const array=nome.split(" ")
                        let  string =''
                        for (key in array) {
                           string=string+array[key]
                        }
        
                        let nome_de_usuario=string.toLowerCase()
                        // Inserir o novo usuário na tabela `usuarios`
                        const createQuery = "INSERT INTO usuarios (nome, senha, genero, email, data_de_nascimento) VALUES (?, ?, ?, ?, ?)";
                        
                        db.query(createQuery,[nome, senhaEncriptada, genero,email,formattedDate],(err,resultt)=>{

                            if(err){
                                console.log("Erro :"+err)
                                res.status(500).json({Mensagem:"Erro interno do servidor  1"})
                            }
                        
                            const selectQuery2 = "SELECT * FROM usuarios WHERE nome_de_usuario = ?";

                           //Verifica se o nome_de_usuario já está sendo usado
                           db.query(selectQuery2,[nome_de_usuario] ,(erro,resultado)=>{

                            if(erro){
                                console.log(" Erro:"+erro.message)
                                return res.status(500).json({Mensagem:"Erro interno do servidor"})
                            }
                            //Se já está sendo usado atribue um identificador único
                            if(resultado.length>0){

                                nome_de_usuario=nome_de_usuario+resultt.insertId

                            }else{
                                

                            }

                            const updateQuery = 'UPDATE  usuarios SET  nome_de_usuario = ? WHERE id_usuario = ?'
                            //Actualiza o nome_de_usuario
                            db.query(updateQuery,[nome_de_usuario,resultt.insertId],(error,resulttt)=>{

                                if(error){
                                    console.log("4 Erro:"+error.message)
                                    return res.status(500).json({Mensagem:"Erro interno do servidor  4"})
                                }
                            //Notificando o usuário
                            const notificacao = "O "+email+" Cadastrou-se na TubSaude";
                            notify.addNotificacao(notificacao);                         
                            return res.status(201).json({ Mensagem: "Usuário cadastrado com sucesso",nome_de_usuario:nome_de_usuario});


                            })

                           })



                        
                          
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
        const { nome_de_usuario, senha } = req.body;

        // Verificar se todos os campos obrigatórios estão presentes
        if (!nome_de_usuario || !senha) {
            return res.status(403).json({ Mensagem: "Campos incompletos" });
        }

     
            // Consultar o usuário com o nome_de_usuario fornecido
            const selectQuery = "SELECT * FROM usuarios WHERE nome_de_usuario = ?";
            db.query(selectQuery, [nome_de_usuario],async (err,result)=>{

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
                    const accessToken = jwt.sign({ id_usuario: usuario.id_usuario,email:usuario.email, nome_de_usuario: usuario.nome_de_usuario,senha:usuario.senha }, secretKey.secretKey);
                     
                    const updateQuery = 'UPDATE usuarios SET token = ? WHERE id_usuario = ?';

                    // Parâmetros para a consulta SQL
                    const params = [accessToken,usuario.id_usuario];
                
                    // Executar a consulta SQL
                    db.query(updateQuery, params, (err, result) => {
                        if (err) {
                            console.error('Erro ao atualizar usuário:', err);
                            return res.status(500).json({ Mensagem: "Erro interno do servidor" });   
                        }

                        return res.status(201).json({ Mensagem: "Autenticação bem-sucedida", accessToken :accessToken});   

                    
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
        const {accessToken ,novo_email} = req.body;
    
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
                
                
                                   const accessToken2 = jwt.sign({ id_usuario: token.usuarioId(accessToken), email:token.usuarioEmail(accessToken),senha:token.usuarioSenha(accessToken) },token.usuarioNome(accessToken), secretKey.secretKey);
                                    
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
    
            if(result[0].token!=accessToken||token.usuarioId(accessToken)!=1){
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
                const notificacao = "O "+email+" eliminou sua conta da TubSaude";
                notify.addNotificacao(notificacao); 
             return  res.json({ mensagem: 'Usuário eliminado com sucesso' });
            });
        } catch (err) {
            console.error('Erro ao eliminar usuário:', err);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao eliminar usuário' });
        }
    },
    obterUsuarioPorAccessToken: async (req, res) => {
        const { accessToken } = req.body;
        if (!accessToken || ! await (token.verificarTokenUsuario(accessToken)) ) {
            return res.status(401).json({ mensagem: 'Token inválido' });
        }
        const selectQuery = 'SELECT * FROM usuarios WHERE token = ?';
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
    },
    cadastrarFoto:async(req,res)=>{
        try {
            upload(req, res, async function(err) {
                if (err) {
                    console.error('Erro ao fazer upload da foto:', err);
                    return res.status(500).send('Erro ao fazer upload da foto');
                }
                const {accessToken } = req.body;
                const tokenValido = await token.verificarTokenUsuario(accessToken);
                if (!tokenValido) {
                    return res.status(401).json({ mensagem: 'Token inválido' });
                }
                const foto = req.file;
                if (!foto) {
                    console.log({ mensagem: 'Nenhuma foto foi enviada' })
                    return res.status(400).json({ mensagem: 'Nenhuma foto foi enviada' });
                }
                
                // Verifica a extensão do arquivo
                const extensao = path.extname(req.file.originalname).toLowerCase();
                
                if (extensao !== '.png' && extensao !== '.jpg' && extensao !== '.jpeg') {
                    return res.status(400).json({ mensagem: 'Formato de arquivo inválido. Apenas arquivos PNG e JPG são permitidos' });
                }

                        const id_usuario=token.usuarioId(accessToken)
                        const email=token.usuarioEmail(accessToken)
                        const senha=token.usuarioSenha(accessToken)
                        const nomeFoto = `${id_usuario}${extensao}`;
                        const pathFoto = `./uploads/${nomeFoto}`;
                        fs.writeFileSync(pathFoto, foto.buffer); 
                        const accessToken2 = jwt.sign({nome_de_usuario:token.usuarioNome(accessToken),foto:pathFoto, id_usuario:id_usuario, email: email,senha:senha }, secretKey.secretKey);
                    
                    const updateQuery = 'UPDATE usuarios SET token = ? WHERE id_usuario = ?';

                    const params = [accessToken2,id_usuario];
                
                    // Executar a consulta SQL
                    db.query(updateQuery, params, (err, result) => {
                        if (err) {
                            console.error('Erro ao atualizar usuário:', err);
                            return res.status(500).json({ Mensagem: "Erro interno do servidor" });   
                        }

                        return res.status(201).json({ Mensagem: "Foto cadastrada com sucesso", Token:accessToken2 });   

                    
                    });
            })
        } catch (error) {
            console.error('Erro ao cadastrar médico:', error.message);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao cadastrar médico' });
        }
    },
    obterFoto:async(req,res)=>{

        const { accessToken } = req.body;
        const id_usuario = token.usuarioId(accessToken);
        if (!id_usuario || !(await token.verificarTokenUsuario(accessToken))) {
            return res.status(401).json({ mensagem: 'Token inválido' });
        }
        const nomeArquivo = token.usuarioFoto(accessToken);
    
        const filePath = path.join(__dirname, '..', '..',  nomeArquivo);
        // Verifica se o arquivo existe
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('Erro ao acessar a imagem:', err);
                return res.status(200).send('Imagem não encontrada');
            }
    
            const formato = path.extname(nomeArquivo).toLowerCase();
    
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Erro ao ler a imagem:', err);
                    return res.status(500).send('Erro ao ler a imagem');
                }
    
                res.writeHead(201, { 'Content-Type': 'image/' + formato });
                res.end(data);
            });
        });
    }
    ,
    receberCodigoParaResetarSenha:async (req,res)=>{

        const {email} = req.body;
        if(!email){
            return res.status(400).json({Mensagem:"Email inválido"})
        }
            // Verifica se o email existe no sistema
            const selectQuery = "SELECT * FROM usuarios where email = ?";
             db.query(selectQuery, [email],async (err,result)=>{

                if(err){
                    console.log('Erro:'+err)
                    return res.status(500).json({Mensagem:"Erro interno no servidor"})
                }
            
                if (result.length===0) {
                    return res.status(403).json({ mensagem: 'Email não existe esse email no  sistema' });
                }
                  // Gera um novo código de verificação e insere na base de dados
                const codigoDeVerificacao = gerarCodigoDeVerificacao();
                const insertCodeQuery = 'INSERT INTO codigos_verificacao (email, codigo, utilizado) VALUES (?, ?, ?)';
                db.query(insertCodeQuery, [email, codigoDeVerificacao, 0],async (erro,results)=>{

                    if(erro){
                        console.log("Erro:"+erro.message)
                        return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    }

                    const valor= await enviarEmail(email, codigoDeVerificacao,res);
                    if(valor){
    
                        return res.status(200).json({ mensagem: 'Email de verificação enviado com sucesso' });
                    
                    }else{
    
                        return res.status(400).json({ mensagem: 'Verifique a sua internet ou seu email não está disponível' });
                    
                    }

                });
    
           })
        
    },
    resetarSenha:async (req,res)=>{
        const {email,codigo,nova_senha}=req.body

        if(!email||!codigo||!nova_senha){

            res.status(400).json({Mensagem:"Campos incompletos"})

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
            // Marca o código de verificação como utilizado
            const updateCodeQuery = 'UPDATE codigos_verificacao SET utilizado = 1 WHERE email = ? AND codigo = ?';
            db.query(updateCodeQuery, [email, codigo],async (err) => {
                if (err) {
                    console.log("Erro :"+err.message)
                    return res.status(500).json({ mensagem: 'Erro interno do servidor'});
                }

                    try {
                        // Encriptar a senha com `bcrypt`
                
                        const senhaEncriptada = await bcrypt.hashSync(nova_senha, salt);
                        // Inserir o novo usuário na tabela `usuarios`

                        const selectQueryS ='SELECT * FROM usuarios WHERE email = ?'

                        db.query(selectQueryS,[email],(erro,resultado)=>{

                            if(erro){
                                console.log("Erro:"+erro.message)
                                return res.status(500).json({Mensagem:"Erro interno do servidor"})
                            }

                            if(resultado.length===0){

                                return res.status(400).json({ Mensagem: "Email não existe no sistema" });

                            }


                            const updateQuery = 'UPDATE usuarios SET senha=? WHERE email = ?';
                        db.query(updateQuery,[senhaEncriptada, email],(err,result)=>{
                
                            if(err){
                                console.log("Erro:"+err)
                            }
                
                           
                                    const usuario = resultado[0] 
                
                                    const accessToken2 = jwt.sign({ id_usuario:usuario.id_usuario, email:usuario.email,senha:usuario.senha,nome_de_usuario:usuario.nome_de_usuario }, secretKey.secretKey);
                                    
                                    const updateQuery = 'UPDATE usuarios SET token = ? WHERE id_usuario = ?';
                
                                    // Parâmetros para a consulta SQL
                                    const params = [accessToken2, usuario.id_usuario];
                                
                                    // Executar a consulta SQL
                                    db.query(updateQuery, params, (err, result) => {
                                        if (err) {
                                            console.error('Erro ao atualizar usuário:', err);
                                            return res.status(500).json({ Mensagem: "Erro interno do servidor" });   
                                        }
                
                                        return res.status(201).json({ Mensagem: "Senha resetada com sucesso", Novo_token:accessToken2 });   
                
                                    
                                    });
                
                
                
                            
                
                
                        })
                        


                        })

                        

                 
                    } catch (err) {
                        console.error({ Erro: err });
                        return res.status(500).json({ Mensagem: "Erro interno do servidor", erro: err });
                    }

                })
            
                    })
                    
    }






    }




module.exports = UsersController;
