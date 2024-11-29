//IMPORTAR MÓDULO EXPRESS
const express = require('express');

//IMPORTAR MÓDULO MYSQL
const mysql = require('mysql2')

//APP
const app = express();

//CONFIGURAÇÃO DE CONEXÃO
const conexao = mysql.createConnection({
    host:'localhost', 
    user: 'root',
    password: 'NPL_BD*81(PEDRO)',
    database: 'BodyCode'
});

//TESTE DE CONEXÃO
conexao.connect(function(erro){
    if (erro) throw erro;
    console.log('Conexão efetuada com sucesso!');
})

// MIDDLEWARE PARA ANALISAR O CORPO DAAS REQUISIÇÕES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EXPORTA A CONEXÃO PARA SER USADA EM OUTROS ARQUIVPOS
module.exports = conexao;

//SERVIDOR
// app.listen(8080);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    // console.log(`Servidor rodando na porta ${PORT}`);
    // console.log(`Acesse a aplicação em http://localhost:${PORT}`);
});