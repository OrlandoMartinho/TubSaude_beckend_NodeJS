
# TubSaude - Backend

Bem-vindo ao TubSaude! Este é o repositório do backend do aplicativo TubSaude, uma plataforma de consultas online.

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

## Respostas

Todas as rotas são retornadas no formado `json`,e cada resposta contém um status HTTP

- **200**:A solicitação foi bem feita mas nenhum recurso foi gerado
- **201**:A solicitação foi feita e um recurso foi gerado na resposta.
- **400**:A solicitação é inválida porque os  dados de entrada estão incorretos ou ausentes.
- **401**:A solicitação requer autenticação e o usuário não foi autenticado ou o token foi alterado.
- **403**:A solicitação foi bem feita, mas o servidor se recusa a autorizá-la por usar um dado inválido ou cadastrar um usuario existente.
- **404**:O resurso não foi encontrado
- **500**:Houve um erro dentro do servidor 


Claro, aqui está o README atualizado para a rota de autenticação do ADM:

---

## Rota do Administrador

Essa rota permite autenticar um administrador (ADM) na aplicação.

### 1. Autenticar ADM

- **Rota**: `POST /administrador`
- **Descrição**: Permite autenticar um administrador (ADM) na aplicação.
- **Corpo da Requisição**: JSON contendo o email e senha do ADM.
- **Exemplo de Requisição**:
  ```json
  {
    "email": "email_do_adm@example.com",
    "senha": "senha_do_adm"
  }
  ```
- **Resposta de Sucesso**:
  - **Código**: 201
  - **Conteúdo**: O token de acesso para o ADM autenticado.
  ```json
  {
    "token": "..."
  }
  ```
- **Resposta de Erro**:
  - **Código**: 400
  - **Conteúdo**: Mensagem de erro caso as credenciais estejam incorretas ou se ocorrer um erro no servidor.


---
## Rotas de Usuários


Essas são as rotas disponíveis para lidar com as operações relacionadas aos usuários na aplicação.

### 1. Receber Código de Verificação

- **Rota**: `POST /usuarios/verificar_email`
- **Descrição**: Permite receber um código de verificação por email para cadastro ou autenticação do usuário.
- **Corpo da Requisição**: 
  ```json
  {
    "email": "{ email }"
  }
  ```

### 2. Cadastrar Usuário

- **Rota**: `POST /usuarios/cadastrar`
- **Descrição**: Permite cadastrar um novo usuário na aplicação.
- **Corpo da Requisição**: Seguir a mesma estrutura que a data do exemplo
  ```json
  {
    "nome": "{nome}",
    "email": "{email}",
    "senha": "{senha}",
    "genero": "{genero}",
    "data_de_nascimento": "3-12-2003",
    "codigo": "{codigo}"
  }
  ```

### 3. Autenticar Usuário

- **Rota**: `POST /usuarios/login`
- **Descrição**: Permite autenticar um usuário na aplicação.
- **Corpo da Requisição**: 
  ```json
  {
    "nome_de_usuario": "{nome_de_usuario}",
    "senha": "{senha}"
  }
  ```

### 4. Editar Usuário

- **Rota**: `PUT /usuarios/`
- **Descrição**: Permite editar os dados de um usuário.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}",
    "novo_email": "{novo_email}"
  }
  ```

### 5. Receber Código Novo

- **Rota**: `PUT /usuarios/receber_codigo_novo`
- **Descrição**: Permite receber um novo código de verificação por email.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 6. Eliminar Usuário

- **Rota**: `DELETE /usuarios/`
- **Descrição**: Permite excluir um usuário da aplicação.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 7. Obter Usuário por AccessToken

- **Rota**: `POST /usuarios/obter_usuario_por_token`
- **Descrição**: Obtém os dados do usuário com base no AccessToken.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 8. Cadastrar Foto do Usuário

- **Rota**: `POST /usuarios/cadastrar_foto`
- **Descrição**: Permite cadastrar uma foto para o usuário.
- **Corpo da Requisição**: Form Data contendo a imagem e o AccessToken do usuário.

### 9. Obter Foto do Usuário

- **Rota**: `POST /usuarios/foto`
- **Descrição**: Obtém a foto do usuário com base no AccessToken.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 10. Receber Código para Resetar a Senha

- **Rota**: `POST /usuarios/receber_codigo_de_reset`
- **Descrição**: Permite receber um código por email para resetar a senha do usuário.
- **Corpo da Requisição**: 
  ```json
  {
    "email": "{email}"
  }
  ```

### 11. Alterar Senha

- **Rota**: `POST /usuarios/alterar_senha`
- **Descrição**: Permite alterar a senha do usuário.
- **Corpo da Requisição**: 
  ```json
  {
    "email": "{email}",
    "codigo": "{codigo}",
    "nova_senha": "{nova_senha}"
  }
  ```

### 12. Excluir Usuário

- **Rota**: `DELETE /usuarios/`
- **Descrição**: Permite excluir um usuário da aplicação.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

---


- **Rota**: `POST /usuarios/obter-usuario-por-accesstoken`
- **Descrição**: Retorna um usuário com base em seu AccessToken.
- **Corpo da Requisição**: JSON contendo o AccessToken do usuário.
  ```json
  {
    "accessToken": "hjkfmcikcmdklldkm..."
  }
  ```

---
## Rotas de Consultas

Aqui estão as rotas para lidar com as operações relacionadas a consultas na aplicação:

### 1. Marcar Consulta

- **Rota**: `POST /consultas/marcar`
- **Descrição**: Permite marcar uma nova consulta.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}",
    "especialidade": "{especialidade}",
    "data_da_consulta": "{data_da_consulta}",
    "nome": "{nome}",
    "email": "{email}"
  }
  ```

### 2. Confirmar Consulta

- **Rota**: `POST /consultas/confirmar_consulta`
- **Descrição**: Permite confirmar uma consulta marcada.
- **Corpo da Requisição**:A hora deve seguir a mesma regra que no exemplo
  ```json
  {
    "accessToken": "{accessToken}",
    "id_consulta": "{id_da_consulta}",
    "hora_da_consulta": "10:00:00"
  }
  ```

### 3. Excluir Consulta

- **Rota**: `DELETE /consultas/`
- **Descrição**: Permite excluir uma consulta pelo ID da consulta e AccessToken do usuário.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}",
    "id_consulta": "{id_da_consulta}"
  }
  ```

### 4. Obter Todas Consultas do Administrador

- **Rota**: `POST /consultas/todas_consultas`
- **Descrição**: Obtém todas as consultas marcadas pelo Administrador.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 5. Obter Todas Consultas do Usuário

- **Rota**: `POST /consultas/consultas_do_usuario`
- **Descrição**: Obtém todas as consultas marcadas pelo usuário.
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```



## Rota para as Especialidades

### 1-Rota para cadastrar mais especialidades
- **Rota**: `POST /consultas/editar_especialidade`
- **Descrição**: Cadastra mais especialidades .
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}",
    "especialidade": "açado,cuzido,fritado"
  }
  ```
### 2-Rota para obter todas especialidades
- **Rota**: `POST /consultas/especialidades`
- **Descrição**: Obtém todas  especialidades da clinica
- **Corpo da Requisição**: 
  ```json
  {
    "accessToken": "{accessToken}",
    "especialidade": "açado,cuzido,fritado"
  }
  ```

## Rotas das conversas

### 1. Criar Conversa

- **Rota**: `POST /conversas/criar`
- **Descrição**: Permite criar uma nova conversa.
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_usuario": "ID do Usuário (obrigatório para ADM, opcional para usuário normal)"
  }
  ```

### 2. Listar Todas Conversas

- **Rota**: `POST /conversas/listar`
- **Descrição**: Lista todas as conversas do sistema.
- **Corpo da Requisição**:Apenas para ADM
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 3. Excluir uma Conversa

- **Rota**: `DELETE /conversas/`
- **Descrição**: Permite excluir uma conversa.
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_conversa": "ID da Conversa"
  }
  ```
## Rotas das Notificações

Aqui estão as rotas corrigidas:

### 1. Obter Todas as Notificações

- **Rota**: `POST /notificacoes/`
- **Descrição**: Permite obter todas as notificações do sistema, disponível apenas para o ADM.
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```

### 2. Marcar Notificação Como Lida

- **Rota**: `POST /notificacoes/visulizar`
- **Descrição**: Permite marcar uma notificação como lida.
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_notificacao": "ID da Notificação"
  }
  ```

## Rota das mensagens

### 1. Enviar Mensagem para um Usuário

- **Rota**: `POST /mensagens/enviar`
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_conversa": "ID da Conversa",
    "conteudo": "Conteúdo da Mensagem"
  }
  ```

### 2. Listar Pessoas com Quem Houve Troca de Mensagens

- **Rota**: `POST /mensagens/listar`
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_conversa": "ID da Conversa"
  }
  ```

### 3. Editar uma Mensagem

- **Rota**: `PUT /mensagens/`
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_mensagem": "ID da Mensagem",
    "novoConteudo": "Novo Conteúdo da Mensagem"
  }
  ```

### 4. Excluir uma Mensagem

- **Rota**: `DELETE /mensagens/`
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
    "id_mensagem": "ID da Mensagem"
  }
  ```

### 5. Enviar uma Mensagem de Arquivo

- **Rota**: `POST /mensagens/enviar_arquivo`
- **Corpo da Requisição**: Form Data com o arquivo de áudio e as informações necessárias.
- **Chaves**:
  - accessToken
  - id_conversa
  - arquivo

### 6. Eliminar um Arquivo

- **Rota**: `DELETE /mensagens/eliminar_arquivo/:nomeDoArquivo`
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}",
  }
  ```

### 7. Obter um Arquivo

- **Rota**: `POST /mensagens/obter_arquivo/:nomeDoArquivo`
- **Corpo da Requisição**:
  ```json
  {
    "accessToken": "{accessToken}"
  }
  ```