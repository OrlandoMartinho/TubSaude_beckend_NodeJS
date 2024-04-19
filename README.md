
# Wakudila - Backend

Bem-vindo ao Wakudila! Este é o repositório do backend do aplicativo Wakudila, uma plataforma de consultas online.

## Descrição

Wakudila é um aplicativo projetado para facilitar consultas online entre profissionais e clientes. Este repositório contém o código-fonte do backend do Wakudila, que é construído em Node.js e utiliza o framework Express.js para criar APIs RESTful.

## Configuração

1. Certifique-se de ter o Node.js instalado em sua máquina.
2. Clone este repositório para o seu ambiente local.
3. Execute `npm install` para instalar todas as dependências necessárias.
4. Ligar um servidor `Apache` & `Mysql`

### Arquivos de Configuração

Os arquivos de configuração podem ser encontrados nas pastas `private` e `docs`.

#### Na pasta `private`

- `CredenciaisAdm.json`: Credenciais de administrador.
- `CredenciaisEmail.json`: Credenciais de e-mail para envio de códigos de verificação.
- `keyDb.json`: Chave do banco de dados.
- `Port.json`: Configuração da porta do servidor.
- `secretKey.json`: Chave secreta para geração de tokens JWT.
- Valores usados por  `default`.

```json

  {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "wakudila_bd" 
} 

```

#### Na pasta `docs`

Esta pasta contém a documentação do projeto, incluindo diagramas de classes e diagramas ER.

- `SQL`: Esta pasta contém o banco de dados em formato SQL.

## Rotas de Usuário

### 1. Receber Código de Verificação

- **Rota**: `POST /usuarios/verificar`
- **Descrição**: Permite que um usuário receba um código de verificação para autenticação.
- **Corpo da Requisição**: JSON contendo o email do usuário.
  ```json
  {
    "email": "exemplo@hhh.com"
  }
  ```

### 2. Autenticar Usuário

- **Rota**: `POST /usuarios/autenticar`
- **Descrição**: Permite que um usuário se autentique utilizando um código de verificação.
- **Corpo da Requisição**: JSON contendo o email do usuário e o código de verificação.
  ```json
  {
    "email": "exemplo@hhh.com",
    "codigo": "0000"
  }
  ```

### 3. Eliminar Usuário

- **Rota**: `DELETE /usuarios/`
- **Descrição**: Permite a exclusão de um usuário.
- **Corpo da Requisição**: Nenhum corpo de requisição necessário.

### 4. Verificar Novo Email e Enviar Código de Verificação

- **Rota**: `POST /usuarios/verificar-novo-email`
- **Descrição**: Permite que um usuário verifique um novo email e receba um código de verificação.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário.
  ```json
  {
    "accessToken": "hjkfmcikcmdklldkm...",
    "emailNovo": "newemail@gmail.com"
  }
  ```

### 5. Atualizar Email

- **Rota**: `PUT /usuarios/`
- **Descrição**: Permite que um usuário atualize seu email.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário, o novo email e o código de verificação.
  ```json
  {
    "accessToken": "hjklç...",
    "emailNovo": "newemail@kkk.com",
    "codigoVerificacao": "0000"
  }
  ```

### 6. Retornar Todos os Usuários

- **Rota**: `POST /usuarios/`
- **Descrição**: Retorna todos os usuários cadastrados.
- **Corpo da Requisição**: Nenhum corpo de requisição necessário.

### 7. Obter Usuário por AccessToken

- **Rota**: `POST /usuarios/obter-usuario-por-accesstoken`
- **Descrição**: Retorna um usuário com base em seu AccessToken.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário.
  ```json
  {
    "accessToken": "hjkfmcikcmdklldkm..."
  }
  ```

---
## Rotas das Notificações


### 1. Obter Todas as Notificações de um Usuario ou Medico

- **Rota**: `POST /notificacoes/`
- **Descrição**: Retorna todas as notificações associadas a um médico ou usuario específico.
- **Corpo da Requisição**: JSON contendo o AccessToken do médico ou usuario.
  ```json
  {
    "accessToken": "token_do_..."
  }
  ```
- **Parâmetros da URL**: Nenhum parâmetro necessário.
- **Exemplo de Uso**: 
  ```
  POST /notificacoes/
  ```

### 2. Marcar uma Notificação como Lida

- **Rota**: `POST /notificacoes/visulizar`
- **Descrição**: Permite marcar uma notificação de um médico ou usuario  como lida.
- **Corpo da Requisição**: JSON contendo o AccessToken do médico ou usuario e o ID da notificação a ser marcada como lida.
  ```json
  {
    "accessToken": "token_do_...",
    "id_notificacao": 123
  }
  ```
- **Exemplo de Uso**: 
  ```
  POST /notificacoes/visulizar
  ```
## Rotas das Consultas ou Marcação


### 1. Marcar uma Consulta

- **Rota**: `POST /consultas/`
- **Descrição**: Permite marcar uma consulta.
- **Corpo da Requisição**: JSON contendo os dados do paciente e o AccessToken do usuário.
  ```json
  {
    "nome_do_paciente": "Nome do Paciente",
    "genero": "Gênero",
    "data_de_nascimento": "YYYY-MM-DD",
    "accessToken": "token_do_usuario"
  }
  ```
- **Exemplo de Uso**: 
  ```
  POST /consultas/
  ```

### 2. Concluir uma Consulta

- **Rota**: `POST /consultas/confirmar_consulta`
- **Descrição**: Permite concluir uma consulta, adicionando o médico associado a ela.
- **Corpo da Requisição**: JSON contendo a data de marcação, nome do médico, AccessToken do médico, ID da consulta e AccessToken do usuário.
  ```json
  {
    "data_de_marcacao": "YYYY-MM-DD HH:MM:SS",
    "nome_do_medico": "Nome do Médico",
    "accessToken": "token_do_medico",
    "id_consulta": 123,
    "accessTokenUser": "token_do_usuario"
  }
  ```
- **Exemplo de Uso**: 
  ```
  POST /consultas/confirmar_consulta
  ```

### 3. Excluir uma Consulta

- **Rota**: `DELETE /consultas/`
- **Descrição**: Permite excluir uma consulta com base no ID da consulta e no AccessToken do usuário.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário e o ID da consulta a ser excluída.
  ```json
  {
    "accessToken": "token_do_usuario",
    "id_consulta": 456
  }
  ```
- **Exemplo de Uso**: 
  ```
  DELETE /consultas/
  ```

### 4. Obter Todas as Consultas do Usuário

- **Rota**: `POST /consultas/consultas_do_usuario`
- **Descrição**: Retorna todas as consultas associadas a um usuário específico.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário.
  ```json
  {
    "accessToken": "token_do_usuario"
  }
  ```
- **Exemplo de Uso**: 
  ```
  POST /consultas/consultas_do_usuario
  ```

### 5. Obter Todas as Consultas do Médico

- **Rota**: `POST /consultas/consultas_do_medico`
- **Descrição**: Retorna todas as consultas associadas a um médico específico.
- **Corpo da Requisição**: JSON contendo o AccessToken do médico.
  ```json
  {
    "accessToken": "token_do_medico"
  }
  ```
- **Exemplo de Uso**: 
  ```
  POST /consultas/consultas_do_medico
  ```

Aqui está o README corrigido:

Aqui está o README corrigido com base nas rotas fornecidas:

### 1. Cadastrar um Relatório

- **Rota**: `POST relatorios/cadastrarRelatorio`
- **Descrição**: Permite cadastrar um novo relatório.
- **Corpo da Requisição**: JSON contendo o nome do paciente, a descrição do relatório e o AccessToken do usuário.
- **Exemplo de Uso**: 
  ```json
  {
    "nome_do_paciente": "Nome do Paciente",
    "descricao": "Descrição do Relatório",
    "accessToken": "..."
  }
  ```

### 2. Editar um Relatório

- **Rota**: `PUT relatorios/editarRelatorioPeloTokenUsuaio`
- **Descrição**: Permite editar um relatório pelo ID do usuário.
- **Corpo da Requisição**: JSON contendo o ID do relatório, o nome do paciente, a descrição do relatório, a data do relatório e o AccessToken do usuário.
- **Exemplo de Uso**: 
  ```json
  {
    "id_relatorio": "ID do Relatório",
    "nome_do_paciente": "Novo Nome do Paciente",
    "descricao": "Nova Descrição do Relatório",
    "accessToken": "..."
  }
  ```

### 3. Excluir um Relatório

- **Rota**: `DELETE relatorios/eliminarRelatorioPeloIdAcessToken`
- **Descrição**: Permite excluir um relatório pelo ID do usuário.
- **Corpo da Requisição**: JSON contendo o ID do relatório e o AccessToken do usuário.
- **Exemplo de Uso**: 
  ```json
  {
    "id_relatorio": "ID do Relatório",
    "accessToken": "..."
  }
  ```

### 4. Obter Todos os Relatórios de um Usuário

- **Rota**: `POST relatorios/obterTodosRelatorioPeloTokenUsuario`
- **Descrição**: Retorna todos os relatórios de um usuário.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "..."
  }
  ```

### 5. Baixar um Relatório em PDF

- **Rota**: `POST relatorios/downloadRelatorioPDF`
- **Descrição**: Permite baixar um relatório em PDF pelo ID do usuário.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "..."
  }
  ```

### 6. Obter Todos os Relatórios (Apenas para Administradores)

- **Rota**: `POST relatorios/todosRelatorios`
- **Descrição**: Retorna todos os relatórios cadastrados no sistema.
- **Corpo da Requisição**: JSON contendo o AccessToken do administrador.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "..."
  }
  ```

Espero que isso ajude a entender as diferentes rotas disponíveis para o gerenciamento de relatórios. Se precisar de mais alguma coisa, estou à disposição.
## Rotas das conversas


### 1. Criar uma Nova Conversa entre um Médico e um Usuário

- **Rota**: `POST /conversas/criar`
- **Descrição**: Permite criar uma nova conversa entre um médico e um usuário.
- **Corpo da Requisição**: JSON contendo os AccessTokens do médico e do usuário.
- **Exemplo de Uso**: 
  ```json
  {
    "accessTokenDoctor": "...",
    "accessToken": "..."
  }
  ```

### 2. Listar Conversas de um Usuário ou Médico

- **Rota**: `POST /conversas/listar`
- **Descrição**: Lista as conversas de um usuário ou médico com base no AccessToken fornecido.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário ou médico.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "..."
  }
  ```

### 3. Eliminar uma Conversa

- **Rota**: `POST /conversas/eliminar`
- **Descrição**: Permite eliminar uma conversa entre um médico e um usuário.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário, o AccessToken do médico e o ID da conversa a ser eliminada.
- **Exemplo de Uso**: 
  ```json
  {
    "accessTokenDoctor": "...",
    "accessToken": "...",
    "conversaId": "..."
  }
  ```
## Rotas das mensagens

Aqui estão as descrições atualizadas das rotas para mensagens:

### 1. Enviar Mensagem para um Usuário

- **Rota**: `POST /mensagens/enviar`
- **Descrição**: Permite enviar uma mensagem para um usuário em uma conversa específica.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário, o ID da conversa e o conteúdo da mensagem.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "...",
    "id_conversa": "ID da Conversa",
    "conteudo": "Conteúdo da Mensagem"
  }
  ```

### 2. Listar Pessoas com Quem Houve Troca de Mensagens

- **Rota**: `POST /mensagens/listar`
- **Descrição**: Lista as pessoas com quem houve troca de mensagens com base no AccessToken do usuário e no ID da conversa.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário e o ID da conversa.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "...",
    "id_conversa": "ID da Conversa"
  }
  ```

### 3. Editar uma Mensagem

- **Rota**: `PUT /mensagens/`
- **Descrição**: Permite editar uma mensagem com base no AccessToken do usuário e no ID da mensagem.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário e o ID da mensagem, além do novo conteúdo da mensagem.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "...",
    "id_mensagem": "ID da Mensagem",
    "novoConteudo": "Novo Conteúdo da Mensagem"
  }
  ```

### 4. Excluir uma Mensagem

- **Rota**: `DELETE /mensagens/`
- **Descrição**: Permite excluir uma mensagem com base no AccessToken do usuário e no ID da mensagem.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário e o ID da mensagem.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "...",
    "id_mensagem": "ID da Mensagem"
  }
  ```

### 5. Enviar Arquivo

- **Rota**: `POST /mensagens/enviar_arquivo`
- **Descrição**: Permite enviar um arquivo como mensagem para um usuário em uma conversa específica.
- **Corpo da Requisição**: O corpo da requisição deve conter o AccessToken do usuário, o ID da conversa e o arquivo a ser enviado.
- **Exemplo de Uso**: 

```javascript
 const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function enviarArquivo() {
    try {
        // URL da API
        const url = 'http://localhost:3000/mensagens/enviar_audio';

        // Dados do arquivo para enviar para a API
        const dadosArquivo = {
            id_conversa: '123',
            accessToken: 'eyJh.Vzt5r75iMbVv2HRYN79hwx7PcRfpsQjO4y7r1eKFSTI...'
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
                ...formData.POSTHeaders() // Define os cabeçalhos do FormData na solicitação
            }
        });

        console.log(response.data); // Exibe a resposta da API
    } catch (error) {
        console.error('Erro ao enviar o arquivo:', error.message);
    }
}

// Chama a função para enviar o arquivo
enviarArquivo();

```

### 6. Excluir Arquivo

- **Rota**: `DELETE /mensagens/eliminar_arquivo/:nomeDoArquivo`
- **Descrição**: Permite excluir um arquivo que foi enviado como mensagem com base no AccessToken do usuário e no nome do arquivo.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário ou médico.
- **Parâmetros da URL**: `nomeDoArquivo` - O nome do arquivo a ser excluído.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "..."
  }
  ```

### 7. Obter Arquivo

- **Rota**: `POST /mensagens/obter_arquivo/:nomeDoArquivo`
- **Descrição**: Permite obter um arquivo com base no nome do arquivo fornecido.
- **Parâmetros da URL**: `nomeDoArquivo` - O nome do arquivo a ser obtido.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário ou médico.
- **Exemplo de Uso**: 
  ```json
  {
    "accessToken": "..."
  }
  ```


Para utilizar as funcionalidades de solicitar, aceitar e rejeitar videochamadas, você precisará fazer solicitações HTTP para as rotas correspondentes do seu servidor backend. Aqui está um guia básico de como usar cada uma dessas funcionalidades:

### 1. Solicitar Videochamada

Para solicitar uma videochamada, você precisará enviar uma solicitação POST para a rota `/solicitar-videochamada` do seu servidor backend. Certifique-se de incluir os tokens de acesso do usuário e do médico no corpo da solicitação, conforme mostrado no exemplo de código JavaScript abaixo:

```javascript
fetch('/solicitar-videochamada', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    "accessTokenUser": "token_do_usuario",
    "accessTokenDoctor": "token_do_medico"
  }),
})
.then(response => response.json())
.then(data => {
  console.log(data); // Aqui você pode lidar com a resposta do servidor
})
.catch(error => {
  console.error('Erro ao solicitar videochamada:', error);
});
```

### 2. Aceitar Videochamada

Para aceitar uma videochamada, você precisará enviar uma solicitação POST para a rota `/aceitar-videochamada` do seu servidor backend. Assim como na solicitação de videochamada, inclua os tokens de acesso do usuário e do médico no corpo da solicitação:

```javascript
fetch('/aceitar-videochamada', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    "accessTokenUser": "token_do_usuario",
    "accessTokenDoctor": "token_do_medico"
  }),
})
.then(response => response.json())
.then(data => {
  console.log(data); // Aqui você pode lidar com a resposta do servidor
})
.catch(error => {
  console.error('Erro ao aceitar videochamada:', error);
});
```

### 3. Rejeitar Videochamada

Para rejeitar uma videochamada, você precisa enviar uma solicitação POST para a rota `/rejeitar-videochamada` do seu servidor backend. Novamente, inclua os tokens de acesso do usuário e do médico no corpo da solicitação:

```javascript
fetch('/rejeitar-videochamada', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    "accessTokenUser": "token_do_usuario",
    "accessTokenDoctor": "token_do_medico"
  }),
})
.then(response => response.json())
.then(data => {
  console.log(data); // Aqui você pode lidar com a resposta do servidor
})
.catch(error => {
  console.error('Erro ao rejeitar videochamada:', error);
});
```

Certifique-se de substituir `"token_do_usuario"` e `"token_do_medico"` pelos tokens de acesso reais do usuário e do médico em cada solicitação. Além disso, verifique se as rotas no frontend correspondem às rotas definidas no backend para manipular essas solicitações.
## Conclusão
