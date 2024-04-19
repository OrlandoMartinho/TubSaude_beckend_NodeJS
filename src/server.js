const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = require('./private/Port.json');
const db = require('./config/dbConfig');
const jwt = require('jsonwebtoken');
const secretKey=require('./private/secretKey.json');

const socketIo = require('socket.io');
const http = require('http'); 


const app = express();

app.use(bodyParser.json());
app.use(cors());




// Importar as rotas
const usersRoutes = require('./routes/UserRoutes');
const notificacoesRoutes = require('./routes/NotificacoesRoutes');
const conversasRoutes = require('./routes/ConversasRoutes');
const admRoutes = require('./routes/AdmRoutes');
const consultasRoutes=require('./routes/ConsultasRoutes')
const mensagensRoutes=require('./routes/MensagemRoutes')



// Adicionar rotas
app.use('/administrador', admRoutes);
app.use('/usuarios', usersRoutes);
app.use('/mensagens',mensagensRoutes)
app.use('/notificacoes', notificacoesRoutes);
app.use('/conversas', conversasRoutes);
app.use('/consultas',consultasRoutes)

// Iniciar o servidor
const PORT = process.env.PORT||3000;

// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);

});
