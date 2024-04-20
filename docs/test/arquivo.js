const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function enviarArquivo() {
    try {
        // URL da API
        const url = 'http://localhost:3000/usuarios/cadastrar_foto';

        // Dados do arquivo para enviar para a API
        const dadosArquivo = {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxMTcsImVtYWlsIjoib3JsYW5kb3BlZHJvMTc2QGdtYWlsLmNvbSIsIm5vbWVfZGVfdXN1YXJpbyI6Im9ybGFuZG9wZWRyb3NhaW9tYm8iLCJzZW5oYSI6IiQyYiQxMCRJNlRHLnZ0VFg3QVBHMjhBbHlMMkFPaFZFZGRUZERIOWFWTEVJSnE5eDR2ZUtaRWtmSkFKcSIsImlhdCI6MTcxMzYyMzgyMn0.kVFn4eFibUtOrweDOYTwCuVdGwFhT1EZU4aT3IxlzmY'
        };

        // Caminho do arquivo a ser enviado
        const caminhoArquivo = '2.jpg'; 

        // Cria um objeto FormData
        const formData = new FormData();

        // Adiciona os dados do arquivo ao FormData
        Object.entries(dadosArquivo).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const extensao = path.extname(caminhoArquivo).toLowerCase();

        const imagemBuffer = fs.readFileSync(caminhoArquivo);

        // Adiciona a imagem ao FormData
        formData.append('foto', imagemBuffer, {
            filename: 'foto.jpg',
            contentType: 'image/'+extensao // Define o tipo de conteúdo da imagem
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
