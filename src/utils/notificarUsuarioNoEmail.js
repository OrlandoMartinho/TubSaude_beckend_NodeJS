const transporter = require('../config/emailConfig');
const credenciais=require('../private/CredenciaisEmails.json')

const enviarMensagem = async (destinatario) => {
    try {// Opções de e-mail
    const mailOptions = {
        from: credenciais.email,
        to: destinatario, 
        subject: "Aprovação de consulta", // Assunto
        html: `<h1 style="font-weight:normal;">A sua consulta foi aprovada aguardamos a sua chegada</h1>`
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

