const fs = require('fs');
const PDFDocument = require('pdfkit');

const pdf = {
    gerarPDF(nomePaciente, descricao, date,id_usuario) {
    try{

       // Crie um novo documento PDF
        const doc = new PDFDocument();

        // Defina o nome do arquivo com base na data atual (por exemplo: 2024-03-28_nome-do-paciente.pdf)
        const fileName = `/${id_usuario}.pdf`;

        // Caminho onde o PDF será salvo
        const filePath = 'uploads/'+fileName;

        // Adicione o conteúdo ao PDF
        doc.fontSize(12)
            .text(`Nome do Paciente: ${nomePaciente}`, 50, 50)
            .text(`Descrição: ${descricao}`, 50, 70)
            .text(`Data: ${date}`, 50, 90);

        // Salve o PDF no sistema de arquivos
        doc.pipe(fs.createWriteStream(filePath));
        doc.end();
        console.log(`PDF salvo em: ${filePath}`);
        return filePath;
        } catch(err){
            console.log("Erros:"+err)
            return "erro:"

        }
        // Retorne o caminho do arquivo para download
      
    }
};

module.exports = pdf;
