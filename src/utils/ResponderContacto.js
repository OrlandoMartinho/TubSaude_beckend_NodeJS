const transporter = require('../config/emailConfig');
const credenciais=require('../private/CredenciaisEmails.json')

const enviarMensagem = async (destinatario,conteudo) => {
    try {// Opções de e-mail

    const mailOptions = {
        from: credenciais.email,
        to: destinatario, 
        subject: "Resposta da TubSaude", // Assunto
        html: `<p>${conteudo}</p>`
    };

    
        // Enviar e-mail
        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso:', info.response);
        return true; // Indica que o e-mail foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar e-mail:'+error);
        return  false // Indica que ocorreu um erro ao enviar o e-mail
    }
};


module.exports = enviarMensagem;

