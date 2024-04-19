const db = require('../config/dbConfig');
const token = require('../utils/token');
const jwt = require('jsonwebtoken');
const secretKey=require('../private/secretKey.json');
const fs = require('fs');
const path = require('path');
const enviarEmail=require('../utils/enviarEmail')
const gerarCodigoDeVerificacao = require('../utils/gerarcodigoDeVerificacao');
const multer=require('multer')


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 } 
}).single('foto'); 


const medicosController = {
    cadastrarMedico: async (req, res) => {
        try {
            upload(req, res, async function(err) {
                if (err) {
                    console.error('Erro ao fazer upload da foto:', err);
                    return res.status(500).send('Erro ao fazer upload da foto');
                }
                const { nome, genero, especialidade, email, diasDeFolga, accessToken } = req.body;

                if(await token.verificarExistenciaEmailMedico(email)){
                         // Verifica se o accessToken pertence a um instituto válido
                const id_instituto = token.admId(accessToken);
                console.log(id_instituto)
                if (id_instituto === null) {
                    console.log(id_instituto + "errrrrrrrrrrrrr")
                    return res.status(200).json({ mensagem: 'Token inválido' });
                }
                
                const foto = req.file;
                if (!foto) {
                    console.log({ mensagem: 'Nenhuma foto foi enviada' })
                    return res.status(200).json({ mensagem: 'Nenhuma foto foi enviada' });
                }
                
                // Verifica a extensão do arquivo
                const extensao = path.extname(req.file.originalname).toLowerCase();
                
                if (extensao !== '.png' && extensao !== '.jpg' && extensao !== '.jpeg') {
                    return res.status(400).json({ mensagem: 'Formato de arquivo inválido. Apenas arquivos PNG e JPG são permitidos' });
                }
                
                const insertMedico = 'INSERT INTO medicos (nome, genero, especialidade, email, dia_de_folga,codigo) VALUES (?, ?, ?, ?, ?,?)';
                
                // Insere o médico na tabela de médicos com o nome temporário da foto
                const codigo = gerarCodigoDeVerificacao();
                // Envie o código por e-mail aqui (método enviarEmail)
                enviarEmail(email, codigo)
                .then(() => {
                    db.query(insertMedico, [nome, genero, especialidade, email, diasDeFolga, codigo], (err, result) => {
                        if (err) {
                            console.log(extensao, err)
                            return res.status(500).json({ mensagem: 'Erro ao cadastrar médico', erro: err });
                        }
                    
                        const idMedico = result.insertId;
                        const nomeFoto = `${idMedico}${extensao}`;
                        const pathFoto = `./uploads/${nomeFoto}`;
                        fs.writeFileSync(pathFoto, foto.buffer); 
                        const medicoToken = jwt.sign({ foto: pathFoto, codigo: codigo, id: idMedico, email: email, accessToken: accessToken }, secretKey.secretKey);
                        // Atualiza o registro do médico recém-cadastrado com o accessToken
                        const updateTokenQuery = 'UPDATE medicos SET accessToken = ? WHERE id_medico = ?';
                        db.query(updateTokenQuery, [medicoToken, idMedico], (err) => {
                            if (err) {
                                return res.status(500).json({ mensagem: 'Erro ao atualizar o accessToken do médico', erro: err });
                            }
                            // Retorna o token JWT como resposta
                            res.json({ mensagem: 'Médico cadastrado com sucesso'});
                        });
                    });
                })
                .catch(error => {
                    return res.status(500).json({ mensagem: 'Erro ao enviar o email de verificação: ' + error });
                });
                }else{
                console.log('Medico já cadastrado')
                 res.status(200).json({ mensagem: 'Medico já cadastrado'})   
                }
               
            });
        } catch (error) {
            console.error('Erro ao cadastrar médico:', error.message);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao cadastrar médico' });
        }
    },
    autenticarMedico: async (req, res) => {
        const { email, codigo } = req.body;
        console.log(email,codigo)
        if (!codigo || !email) {
            return res.status(200).json({ mensagem: 'Código ou email inválido' });
        }
        
        try {
            const query = 'SELECT * FROM medicos WHERE email = ? AND codigo = ?';
            db.query(query, [email, codigo], async (err, result) => {
                if (err) {
                    return res.status(500).json({ mensagem: 'Erro ao buscar token do médico', erro: err });
                }
                if (result.length === 0) {
                    return res.status(200).json({ mensagem: 'Médico não encontrado ou código inválido' });
                }
    
                const medicoToken = result[0].accessToken;
                const idMedico = result[0].id_medico;
                const foto = token.medicoFoto(medicoToken);
                const accessToken = token.ExtrairTokenAdm(medicoToken);
                
                const emailNaoExiste = await token.verificarEmailMedico(email);
                console.log(emailNaoExiste)
                if (emailNaoExiste==false) {
                    const medicoTokenNew = jwt.sign({ foto, codigo, id: idMedico, email, accessToken }, secretKey.secretKey);
                    
                    const updateTokenQuery = 'UPDATE medicos SET accessToken = ?, sessao = ? WHERE id_medico = ?';
                    db.query(updateTokenQuery, [medicoTokenNew, 1, idMedico], (err) => {
                        if (err) {
                            return res.status(500).json({ mensagem: 'Erro ao atualizar o accessToken do médico', erro: err });
                        }
                        res.json({ mensagem: 'Médico já autenticado novo token', medicoToken: medicoTokenNew });
                    });
                } else {
                    const updateTokenQuery = 'UPDATE medicos SET sessao = ? WHERE id_medico = ?';
                    db.query(updateTokenQuery, [1, idMedico], (err) => {
                        if (err) {
                            return res.status(500).json({ mensagem: 'Erro ao atualizar o accessToken do médico', erro: err });
                        }
                        res.status(200).json({ mensagem: 'Médico autenticado com sucesso', medicoToken });
                    });
                    
                }
            });
        } catch (error) {
            console.error('Erro ao autenticar o médico:', error);
            return res.status(500).json({ mensagem: 'Erro ao autenticar o médico', erro: error });
        }
    }   
    ,
    eliminarMedico: async (req, res) => {
        const { accessToken,accessTokenAdm } = req.body;
        const id_instituto=token.admId(accessTokenAdm)

        if(!id_instituto || !await token.verificarTokenMedico(accessToken)){
            res.status(200).json({ mensagem: 'Token de Adm inválido' });
            return;
        }

        const deletarMedico = 'DELETE FROM medicos WHERE id_medico = ?';
        const id_medico=token.medicoId(accessToken)
        db.query(deletarMedico, [id_medico], (err) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao eliminar médico' });
                return;
            }
            res.json({ mensagem: 'Médico eliminado com sucesso' });
        });
    },
    editarMedico: async (req, res) => {
        try {
            upload(req, res, async function(err) {
                if (err) {
                    console.error('Erro ao fazer upload da foto:', err);
                    return res.status(500).send('Erro ao fazer upload da foto');
                }
    
                const { nome, genero, especialidade, email, diasDeFolga, accessToken, accessTokenDoctor } = req.body;
    
                // Verifica se o accessToken pertence a um instituto válido
                const id_instituto = token.admId(accessToken);
    
                if (!id_instituto || !(await token.verificarTokenMedico(accessTokenDoctor))) {
                    return res.status(200).json({ mensagem: 'Token inválido' });
                }
    
                const foto = req.file;
                if (!foto) {
                    return res.status(400).json({ mensagem: 'Nenhuma foto foi enviada' });
                }
    
                // Verifica a extensão do arquivo
                const extensao = path.extname(req.file.originalname).toLowerCase();
                if (extensao !== '.png' && extensao !== '.jpg' && extensao !== '.jpeg') {
                    return res.status(400).json({ mensagem: 'Formato de arquivo inválido. Apenas arquivos PNG e JPG são permitidos' });
                }
    
                // Query para atualizar os dados do médico na tabela de médicos
                const editarMedico = 'UPDATE medicos SET nome = ?, genero = ?, especialidade = ?, email = ?, diasDeFolga = ? WHERE id_medico = ?';
    
                // Gera um código de verificação
                const codigo = gerarCodigoDeVerificacao();
    
                // Envie o código por e-mail
                enviarEmail(email, codigo)
                .then(() => {
                    // Executa a query de atualização
                    db.query(editarMedico, [nome, genero, especialidade, email, diasDeFolga, id_medico], (err, result) => {
                        if (err) {
                            return res.status(500).json({ mensagem: 'Erro ao editar médico', erro: err });
                        }
    
                        // Obtém o ID do médico recém-editado
                        const idMedico = result.insertId;
                        
                        // Salva a foto na pasta de uploads
                        const nomeFoto = `${idMedico}${extensao}`;
                        const pathFoto = `./uploads/${nomeFoto}`;
                        fs.writeFileSync(pathFoto, foto.buffer);
    
                        // Gera um token JWT para o médico
                        const medicoToken = jwt.sign({ foto: pathFoto, codigo: codigo, id: idMedico, email: email, accessToken: accessToken }, secretKey.secretKey);
    
                        // Atualiza o registro do médico com o novo token e foto
                        const updateTokenQuery = 'UPDATE medicos SET accessToken = ? WHERE id_medico = ?';
                        db.query(updateTokenQuery, [medicoToken, idMedico], (err) => {
                            if (err) {
                                return res.status(500).json({ mensagem: 'Erro ao atualizar o accessToken do médico', erro: err });
                            }
                            // Retorna o token JWT como resposta
                            res.json({ mensagem: 'Médico editado com sucesso', NovoToken: medicoToken });
                        });
                    });
                })
                .catch(error => {
                    return res.status(500).json({ mensagem: 'Erro ao enviar o email de verificação: ' + error });
                });
            });
        } catch (error) {
            console.error('Erro ao editar médico:', error.message);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao editar médico' });
        }
    } 
    ,
    obterTodos: async (req, res) => {
     
        const {accessToken}=req.body

        const  id=token.admId(accessToken)
        
        if(!id){
         res.status(500).json({mensagem:"Token inválido"})
        }else{
            const obterMedicos = 'SELECT * FROM medicos ';

        db.query(obterMedicos, (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao obter médicos' });
                return;
            }
            res.json(result);
        });
        }
        
    },
    obterUmMedico: async (req, res) => {
        const { accessToken } = req.body;

        const id =token.medicoId(accessToken)
            if(!id||!(await token.verificarTokenMedico(accessToken))){
             res.status(500).json({"Mensagem":"Token inválido"})   
            }
        const obterMedico = 'SELECT * FROM medicos WHERE  id_medico = ?';

        db.query(obterMedico, [id], (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao obter médico' ,erro:err});
                return;
            }
            res.json(result);
        });
    }
    ,marcarMedicoComoDisponivel:async(req,res)=>{
        const {accessToken} = req.body;
    
        // Aqui você deve implementar a lógica para obter o ID do médico com base no token do médico
        const idMedico = token.medicoId(accessToken); // Supondo que token.medicoId() é uma função válida para obter o ID do médico
    
    
    
        if (!idMedico || !await token.verificarTokenMedico(accessToken)) {
            return res.status(200).json({ mensagem: 'Token inválidos' });
        }
        
        var  status=0
        var  estadoonline=""
        const obterMedico = 'SELECT * FROM medicos WHERE  id_medico = ?';

        db.query(obterMedico, [idMedico], (err, result) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao obter médico' ,erro:err});
                return;
            }
            const estado=result[0].estado_online
            if(estado==0){
                status=1 
                estadoonline="Activo"
            }else if(estado==1){
                status=0
                estadoonline="Desactivo"
            }
            const editarMedico = 'UPDATE medicos SET estado_online = ?  WHERE id_medico = ?';
    
            db.query(editarMedico, [status, idMedico], (err, result) => {
                if (err) {
                    return res.status(500).json({ mensagem: 'Erro ao editar médico', erro: err });
                }    
                    // Retorne o novo token como resposta
                    res.json({ mensagem: 'Marcado com sucesso',"Estado":estadoonline});
                });
        });

        

       
    },
    imagemDoMedico: async (req, res) => {
        const { accessToken } = req.body;
        const id_medico = token.medicoId(accessToken);
        if (!id_medico || !(await token.verificarTokenMedico(accessToken))) {
            return res.status(200).json({ mensagem: 'Token inválido' });
        }
        const nomeArquivo = token.medicoFoto(accessToken);
    
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
    
                res.writeHead(200, { 'Content-Type': 'image/' + formato });
                res.end(data);
            });
        });
    }
     
};

module.exports = medicosController;
