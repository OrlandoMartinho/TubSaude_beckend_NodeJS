const db = require('../config/dbConfig');
const data = require('../utils/converterData');
const token = require('../utils/token');
const multer=require('multer')
const path=require('path')
const fs=require('fs')
// Configuração completa do multer
const upload = multer({
    limits: { fileSize: 1 * 1024 * 1024 }, // Define o limite de tamanho do arquivo para 1MB
    fileFilter: (req, file, cb) => {
        // Verifica se o tipo de arquivo é aceito
        if (!file.originalname.match(/\.(png|jpg|jpeg|pdf|txt|mp3|wave|m4a|doc|docx)$/)) {
            return cb(new Error('Tipo de arquivo inválido'));
        }
        cb(null, true);
    }
}).single('file'); 


const mensagensController = {
    // Enviar uma nova mensagem em uma conversa
    enviarMensagem: async (req, res) => {
        try {
            const { accessToken, id_conversa, conteudo } = req.body;
    
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);
    
            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                res.status(200).json({ error: 'Erro ao enviar mensagem: ID do usuário ou médico não encontrado' });
                return;
            }
            if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }
    
            const id = userId || doctorId;
    
            const date = data.toString();
            const enviarMensagemQuery = `INSERT INTO mensagens (conteudo, id_conversa, id_usuario, id_medico) VALUES (?, ?, ?, ?)`;
            db.query(enviarMensagemQuery, [conteudo,  id_conversa, userId, doctorId], (err, result) => {
                if (err) {
                    console.error('Erro ao enviar a mensagem:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao enviar mensagem' });
                    return;
                }
    
                console.log("Nova mensagem enviada com sucesso");
                res.status(200).json({ message: 'Mensagem enviada com sucesso' });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao enviar mensagem' });
        }
    },
    // Listar mensagens de uma conversa de um usuário ou médico em ordem de envio
    listarMensagens:async (req, res) => {
        try {
            const { accessToken, id_conversa } = req.body;
    
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);
    
            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                res.status(200).json({ error: 'Erro ao listar mensagens: ID do usuário ou médico não encontrado' });
                return;
            }

            if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }
    
            const id = userId || doctorId;
    
            const listarMensagensQuery = `
                SELECT * FROM mensagens where id_conversa=${id_conversa} 
            `;
    
            db.query(listarMensagensQuery, (err, result) => {
                if (err) {
                    console.error('Erro ao listar mensagens:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao listar mensagens' });
                    return;
                }
    
                res.status(200).json({ mensagens: result });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao listar mensagens' });
        }
    },
    // Excluir uma mensagem em uma conversa
    excluirMensagem:async (req, res) => {
        try {
            const { accessToken, id_mensagem } = req.body;
    
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);
    
            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                res.status(200).json({ error: 'Erro ao excluir mensagem: ID do usuário ou médico não encontrado' });
                return;
            }
    
            const id = userId || doctorId;
    
            if( !(await token.verificarTokenUsuario(accessTokenUser)) || !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }



            const verificarMensagemQuery = `SELECT id_usuario, id_medico FROM mensagens WHERE id_mensagem = ?`;
            db.query(verificarMensagemQuery, [id_mensagem], (err, result) => {
                if (err) {
                    console.error('Erro ao verificar a mensagem:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao verificar a mensagem' });
                    return;
                }
    
                if (result.length === 0) {
                    console.error('Mensagem não encontrada');
                    res.status(404).json({ error: 'Mensagem não encontrada' });
                    return;
                }
    
                const mensagem = result[0];
                if (mensagem.id_usuario !== id && mensagem.id_medico !== id) {
                    console.error('Usuário ou médico não tem permissão para excluir esta mensagem');
                    res.status(403).json({ error: 'Usuário ou médico não tem permissão para excluir esta mensagem' });
                    return;
                }
    
                const excluirMensagemQuery = `DELETE FROM mensagens WHERE id_mensagem = ?`;
                db.query(excluirMensagemQuery, [id_mensagem], (err, result) => {
                    if (err) {
                        console.error('Erro ao excluir mensagem:', err.message);
                        res.status(500).json({ error: 'Erro interno do servidor ao excluir mensagem' });
                        return;
                    }
    
                    console.log('Mensagem excluída com sucesso');
                    res.status(200).json({ message: 'Mensagem excluída com sucesso' });
                });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao excluir mensagem' });
        }
    },
    // Editar o conteúdo de uma mensagem em uma conversa
    editarMensagem:async (req, res) => {
        try {
            const { accessToken, id_mensagem, novoConteudo } = req.body;
    
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);
    
            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                res.status(200).json({ error: 'Erro ao editar mensagem: ID do usuário ou médico não encontrado' });
                return;
            }
    
            const id = userId || doctorId;
            if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                return res.status(200).json({ mensagem: 'Tokens inválidos' });
            }
            const verificarMensagemQuery = `SELECT id_usuario, id_medico FROM mensagens WHERE id_mensagem = ?`;
            db.query(verificarMensagemQuery, [id_mensagem], (err, result) => {
                if (err) {
                    console.error('Erro ao verificar a mensagem:', err.message);
                    res.status(500).json({ error: 'Erro interno do servidor ao verificar a mensagem' });
                    return;
                }
    
                if (result.length === 0) {
                    console.error('Mensagem não encontrada');
                    res.status(404).json({ error: 'Mensagem não encontrada' });
                    return;
                }
    
                const mensagem = result[0];
                if (mensagem.id_usuario !== id && mensagem.id_medico !== id) {
                    console.error('Usuário ou médico não tem permissão para editar esta mensagem');
                    res.status(403).json({ error: 'Usuário ou médico não tem permissão para editar esta mensagem' });
                    return;
                }
    
                const editarMensagemQuery = `UPDATE mensagens SET conteudo = ? WHERE id_mensagem = ?`;
                db.query(editarMensagemQuery, [novoConteudo, id_mensagem], (err, result) => {
                    if (err) {
                        console.error('Erro ao editar mensagem:', err.message);
                        res.status(500).json({ error: 'Erro interno do servidor ao editar mensagem' });
                        return;
                    }
    
                    console.log('Mensagem editada com sucesso');
                    res.status(200).json({ message: 'Mensagem editada com sucesso' });
                });
            });
        } catch (error) {
            console.error('Erro ao decodificar o token do usuário ou médico:', error.message);
            res.status(500).json({ error: 'Erro interno do servidor ao editar mensagem' });
        }
    },
    enviarMensagemDeArquivo: async (req, res) => {
            try {
                upload(req, res, async function(err) {
                    if (err) {
                        console.error('Erro ao fazer upload da audio:', err);
                        return res.status(500).send('Erro ao fazer upload da audio');
                    }
                    const { accessToken, id_conversa} = req.body;
                    console.log(accessToken)
                    const userId = token.usuarioId(accessToken);
                    const doctorId = token.medicoId(accessToken);
            
                    if (!userId && !doctorId) {
                        console.error('Erro ao obter ID do usuário ou médico');
                        res.status(200).json({ error: 'Erro ao enviar mensagem: ID do usuário ou médico não encontrado' });
                        return;
                    }
                    if( !(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))){
                        return res.status(200).json({ mensagem: 'Tokens inválidos' });
                    }
            
                    const audio = req.file;
                    if (!audio) {
                        console.log({ mensagem: 'Nenhuma audio foi enviada' })
                        return res.status(200).json({ mensagem: 'Nenhuma audio foi enviada' });
                    }
                    
                    // Verifica a extensão do arquivo
                    const extensao = path.extname(req.file.originalname).toLowerCase();
                    console.log(extensao)
                    if (!['.png', '.jpg', '.jpeg', '.pdf', '.txt', '.mp3', '.wav', '.m4a', '.doc', '.docx'].includes(extensao)) {
                        return res.status(400).json({ mensagem: 'Formato de arquivo inválido. Apenas arquivos PNG, JPG, JPEG, PDF, TXT, MP3, WAV, M4A, DOC e DOCX são permitidos' });
                    }

                       


                        const date = data.toString();
                        const enviarMensagemQuery = `INSERT INTO mensagens (id_conversa, id_usuario, id_medico) VALUES ( ?, ?, ?)`;
                        db.query(enviarMensagemQuery, [ id_conversa, userId, doctorId], (err, result) => {
                            if (err) {
                                console.error('Erro ao enviar a mensagem:', err.message);
                                res.status(500).json({ error: 'Erro interno do servidor ao enviar mensagem' });
                                return;
                            }

                            const id_mensagem = result.insertId;
                            const nomeAudio = `arquivo${id_conversa}${id_mensagem}${extensao}`;
                            const pathAudio = `./uploads/Menssager/${nomeAudio}`;
                            fs.writeFileSync(pathAudio, audio.buffer);
                            const conteudo = nomeAudio
                            const  queryUpdate=`UPDATE mensagens SET conteudo = ? WHERE id_mensagem = ?;`
                            db.query(queryUpdate, [conteudo, id_mensagem],(erro,resultado)=>{
                                if(erro){
                                    console.log("Erro ao gravar arquivo na tabela")
                                    res.status(500).json({ERRO:erro})
                                }


                            console.log("Arquivo enviado com sucesso");
                            res.status(200).json({ message: 'Arquivo enviado com sucesso' });

                            })
                           
                        });



                    
                    })
            } catch (error) {
                console.error('Erro ao Enviar Audio:', error.message);
                res.status(500).json({ mensagem: 'Erro ao Enviar Audio:' });
            }
    },
    retornarArquivo: async (req, res)=> {
        try {
            const { accessToken } = req.body;
            const { nomeDoArquivo } = req.params;
            console.log(nomeDoArquivo)
            // Verifica se o usuário ou médico está autenticado
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);
            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                return res.status(400).json({ error: 'Erro ao retornar arquivo: ID do usuário ou médico não encontrado' });
            }
    
            // Verifica se o token é válido
            if (!(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))) {
                return res.status(401).json({ mensagem: 'Token inválido' });
            }
    
            // Verifica se o arquivo existe
            const caminhoArquivo = path.join(__dirname,'../','../','uploads','Menssager', nomeDoArquivo);
            if (!fs.existsSync(caminhoArquivo)) {
                return res.status(404).json({ mensagem: 'Arquivo não encontrado',caminho:caminhoArquivo });
            }
    
            // Lê o conteúdo do arquivo
            const conteudoArquivo = fs.readFileSync(caminhoArquivo);
    
            // Retorna o conteúdo do arquivo
            res.status(200).send(conteudoArquivo);
        } catch (error) {
            console.error('Erro ao retornar arquivo:', error.message);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao retornar arquivo' });
        }
    },
    excluirArquivo:async(req, res)=> {
        try {
            const { accessToken } = req.body;
            const { nomeArquivo } = req.params;
    
            // Verifica se o usuário ou médico está autenticado
            const userId = token.usuarioId(accessToken);
            const doctorId = token.medicoId(accessToken);
            if (!userId && !doctorId) {
                console.error('Erro ao obter ID do usuário ou médico');
                return res.status(400).json({ error: 'Erro ao excluir arquivo: ID do usuário ou médico não encontrado' });
            }
    
            // Verifica se o token é válido
            if (!(await token.verificarTokenUsuario(accessToken)) && !(await token.verificarTokenMedico(accessToken))) {
                return res.status(401).json({ mensagem: 'Token inválido' });
            }
    
            // Verifica se o arquivo existe
            const caminhoArquivo = path.join(__dirname, 'uploads', 'Menssager', nomeArquivo);
            if (!fs.existsSync(caminhoArquivo)) {
                return res.status(404).json({ mensagem: 'Arquivo não encontrado' });
            }
    
            // Exclui o arquivo
            fs.unlinkSync(caminhoArquivo);
    
            // Retorna uma mensagem de sucesso
            res.status(200).json({ mensagem: 'Arquivo excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error.message);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao excluir arquivo' });
        }
    }
}
module.exports = mensagensController;
