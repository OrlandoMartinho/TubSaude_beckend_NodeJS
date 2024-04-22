const db = require('../config/dbConfig');
const data = require('../utils/converterData');
const token = require('../utils/token');
const multer=require('multer')
const path=require('path')
const notify = require('../controllers/NotificacoesController');
const fs=require('fs')
const secretKey=require('../private/secretKey.json');
const jwt = require('jsonwebtoken');
const credenciaisAdm=require('../private/CredenciaisADM.json')
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



function enviar(res,conteudo,id_conversa,nome_de_usuario){

    const enviarMensagemQuery = `INSERT INTO mensagens (conteudo, id_conversa,nome_de_usuario) VALUES (?, ?, ?)`;
    db.query(enviarMensagemQuery, [conteudo,  id_conversa,nome_de_usuario], (err, result) => {
        if (err) {
            console.error('Erro ao enviar a mensagem:', err.message);
            res.status(500).json({ error: 'Erro interno do servidor ao enviar mensagem' });
            return;
        }

        console.log("Nova mensagem enviada com sucesso");
      return  res.status(200).json({ message: 'Mensagem enviada com sucesso' });
    });
}

function listar(res,id_conversa){

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


}

function enviarArquivo(res,id_conversa,arquivo,nome_de_usuario,extensao){
    const enviarMensagemQuery = `INSERT INTO mensagens (id_conversa) VALUES (?)`;
    db.query(enviarMensagemQuery, [ id_conversa], (err, result) => {
        if (err) {
            console.error('Erro ao enviar a mensagem:', err.message);
            res.status(500).json({ error: 'Erro interno do servidor ao enviar mensagem' });
            return;
        }

        const id_mensagem = result.insertId;
        const nomeAudio = `arquivo${id_conversa}${id_mensagem}${extensao}`;
        const pathAudio = `./uploads/Menssager/${nomeAudio}`;
        fs.writeFileSync(pathAudio, arquivo.buffer);
        const conteudo = nomeAudio
        const  queryUpdate=`UPDATE mensagens SET conteudo = ?, nome_de_usuario = ? WHERE id_mensagem = ?;`
        db.query(queryUpdate, [conteudo,nome_de_usuario,id_mensagem],(erro,resultado)=>{
            if(erro){
                console.log("Erro ao gravar arquivo na tabela")
               return res.status(500).json({ERRO:erro})
            }


        console.log("Arquivo enviado com sucesso");
       return  res.status(200).json({ message: 'Arquivo enviado com sucesso' });

        })
    });
}

const mensagensController = {
    // Enviar uma nova mensagem em uma conversa
    enviarMensagem: async (req, res) => {
            const { accessToken, id_conversa, conteudo ,} = req.body;
            
            if(!(await token.verificarTokenUsuario(accessToken))){
                return res.status(401).json({ mensagem: 'Tokens inválidos' });
            }

            if(!conteudo){
                return res.status(400).json({ mensagem: 'Dados incompletos' });
            }
            const nome_de_usuario=token.usuarioNome(accessToken)
            const userId=token.usuarioId(accessToken)
            if(userId!=1){
                const notificacao = token.usuarioEmail(accessToken)+" Enviou uma mensagem nova ";
                notify.addNotificacao(notificacao); 
            }
    
            if(userId===1){
              enviar(res,conteudo,id_conversa,nome_de_usuario)
            }else{
                const selectQuery='SELECT * FROM conversas where id_usuario =?'
                console.log(userId)
                db.query(selectQuery,[userId],(err,result)=>{
                    if(err){
                        console.log("Erro:"+err.message)
                        return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    }
                    if(userId==result[0].id_usuario){
                       enviar(res,conteudo,id_conversa,nome_de_usuario)
                    }else{
                        return res.status(400).json({ message: 'O usuario não tem permissão para enviar mensagem nesta conversa' });
                        
                    }

                })
            }
           
        
    },
    // Listar mensagens de uma conversa de um usuário ou médico em ordem de envio
    listarMensagens:async (req, res) => {

            const { accessToken, id_conversa} = req.body;
          
            if(!(await token.verificarTokenUsuario(accessToken))){
                return res.status(401).json({ mensagem: 'Tokens inválidos' });
            }
            if(token.usuarioId(accessToken)===1){
                listar(res,id_conversa)
          
            }else{
                
                const id_usuario=token.usuarioId(accessToken)

                const selectQuery="SELECT id_conversa FROM conversas WHERE id_usuario = "+id_usuario
               
                db.query(selectQuery,(err,result)=>{

                    if(err){
                        console.log("Erro:"+err.message)
                        return res.status(500).json({Mensagem:"Erro interno do servidor"})
                    }

                    if(result[0].id_conversa!=id_conversa){
                        return res.status(400).json({Mensagem:"Usuário não permição de enviar mensagem"})
                    }

                    listar(res,id_conversa)


                })



            }




    
       
        
    },
    // Excluir uma mensagem em uma conversa
    excluirMensagem:async (req, res) => {

            const { accessToken, id_mensagem} = req.body;
            
            if(!(await token.verificarTokenUsuario(accessToken)) &&!validarAdm){
                return res.status(401).json({ mensagem: 'Tokens inválidos' });
            }

            const id=token.usuarioId(accessToken)
            const nome_de_usuario=token.usuarioNome(accessToken)
            const verificarMensagemQuery = `SELECT id_usuario FROM mensagens WHERE id_mensagem = ?`;

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
                if (mensagem.nome_de_usuario !== nome_de_usuario ) {
                    console.error('Usuário  não tem permissão para excluir esta mensagem');
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
    },
    // Editar o conteúdo de uma mensagem em uma conversa
    editarMensagem:async (req, res) => {
        try {
            const { accessToken, id_mensagem,novoConteudo} = req.body;
            
            
            if(!(await token.verificarTokenUsuario(accessToken))){
                return res.status(401).json({ mensagem: 'Tokens inválidos' });
            }

            if(!novoConteudo){
                return res.status(400).json({ mensagem: 'Campos incompletos' });
            }

          const nome_de_usuario=token.usuarioId(accessToken)

            const verificarMensagemQuery = `SELECT id_usuario FROM mensagens WHERE id_mensagem = ?`;
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
                if (mensagem.nome_de_usuario !== nome_de_usuario) {
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
                    
                    if(!(await token.verificarTokenUsuario(accessToken)) ){
                        return res.status(401).json({ mensagem: 'Tokens inválidos' });
                    }
        
        
                    const id=token.usuarioId(accessToken)
                    
                    const nome_de_usuario=token.usuarioId(accessToken)
        
                    const arquivo = req.file;
                    if (!arquivo) {
                        console.log({ mensagem: 'Nenhum arquivo foi enviado' })
                        return res.status(400).json({ mensagem: 'Nenhuma audio foi enviada' });
                    }

                    if (!id_conversa) {
                        return res.status(400).json({ mensagem: 'Valores incompletos' });
                    }
                    
                    // Verifica a extensão do arquivo
                    const extensao = path.extname(arquivo.originalname).toLowerCase();
                    console.log(extensao)
                    if (!['.png', '.jpg', '.jpeg', '.pdf', '.txt', '.mp3', '.wav', '.m4a', '.doc', '.docx'].includes(extensao)) {
                        return res.status(400).json({ mensagem: 'Formato de arquivo inválido. Apenas arquivos PNG, JPG, JPEG, PDF, TXT, MP3, WAV, M4A, DOC e DOCX são permitidos' });
                    }

                    if(id!=1){
                        const selectQuery='SELECT * FROM conversas where id_usuario =?'
                
                        db.query(selectQuery,[id],(err,result)=>{
                            if(err){
                                console.log("Erro:"+err.message)
                                return res.status(500).json({Mensagem:"Erro interno do servidor"})
                            }
        
                            if(id ==result[0].id_usuario){
                                enviarArquivo(res,id_conversa,arquivo,nome_de_usuario,extensao)
                              
                            }else{
                                return res.status(400).json({ message: 'O usuario não tem permissão para enviar mensagem nesta conversa' });
                                
                            }
        
                        })
                    }else{
                        enviarArquivo(res,id_conversa,arquivo,nome_de_usuario,extensao)
                    }


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
            const email= token.usuarioEmail(accessToken);
            const validarAdm=email===credenciaisAdm.email
            
            if(!(await token.verificarTokenUsuario(accessToken)) &&!validarAdm){
                return res.status(401).json({ mensagem: 'Tokens inválidos' });
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
    
            const email= token.usuarioEmail(accessToken);
            const validarAdm=email===credenciaisAdm.email
            
            if(!(await token.verificarTokenUsuario(accessToken)) &&!validarAdm){
                return res.status(401).json({ mensagem: 'Tokens inválidos' });
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
