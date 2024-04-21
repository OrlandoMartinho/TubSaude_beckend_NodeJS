const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function enviarArquivo() {
    try {
        // URL da API
        const url = 'http://localhost:3000/mensagens/enviar_arquivo';

        // Dados do arquivo para enviar para a API
        const dadosArquivo = {
            id_conversa: '4',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxLCJlbWFpbCI6ImNsaW5pY2FnaXJhc3Nzb2xAZ21haWwuY29tIiwic2VuaGEiOiIkMmIkMTAkYjJxbHhJckVWd2ZVVUYuYUNLRERMT0h5SUZSYkNEMEM5VWpSUFpTQVZRYmNRNXlzY21Cc08iLCJpYXQiOjE3MTM3MDI1NjR9.qs5iBoKNS-JgBwQPXSlvyBXCMKtBmXF1Ia8IdKwMOSc'
        };

        // Caminho do arquivo a ser enviado
        const caminhoArquivo = '3.mp3'; // Substitua 'arquivo.pdf' pelo caminho do seu arquivo

        // Cria um objeto FormData
        const formData = new FormData();

        // Adiciona os dados do arquivo ao FormData
        Object.entries(dadosArquivo).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Lê o conteúdo do arquivo como um buffer
        const arquivoBuffer = fs.readFileSync(caminhoArquivo);
        const extensao = path.extname(caminhoArquivo).toLowerCase();

        // Adiciona o arquivo ao FormData
        formData.append('file', arquivoBuffer, {
            filename: path.basename(caminhoArquivo), // Obtém o nome do arquivo
            contentType: `file/${extensao}` // Define o tipo de conteúdo do arquivo
        });

        // Faz a solicitação POST para a API com os dados do arquivo
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders() // Define os cabeçalhos do FormData na solicitação
            }
        });

        console.log(response.data); // Exibe a resposta da API
    } catch (error) {
        console.error('Erro ao enviar o arquivo:', error.message);
    }
}

// Chama a função para enviar o arquivo
enviarArquivo();
