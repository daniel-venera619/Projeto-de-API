// aqui ficam as configurações da aplicação, como rotas e middlewares

const express = require('express');
// Importa o framework Express para criar o servidor e gerenciar rotas.

const app = express();
// Cria uma instância do Express, que será usada para configurar rotas e middlewares.

const {testConnection} = require(`./config/db`);
// Importa a função testConnection do arquivo config/db.js, responsável por testar a conexão com o banco de dados.

const serverRoutes = require(`./server`);
// Importa o módulo de rotas principal definido em server.js.

try{
    app.use(express.json());
    // Middleware que permite ao servidor interpretar requisições com corpo em JSON.

    app.get(`/`, (req, res) => //rota principal: (https://localhost/3001:{rota})
        res.send(
            {status: `ok`, message: `Funcionando`}
        )  
    );
    // Define a rota GET "/" que retorna um objeto JSON confirmando que o servidor está funcionando.
    
    app.use(`/`, serverRoutes);
    // Usa as rotas definidas em serverRoutes, aplicando-as a partir do caminho base "/".
    
    async function verificarDB() {
        const resultado = await testConnection();
        console.log(resultado.message);
    }
    // Função assíncrona que chama testConnection para verificar se o banco de dados está acessível
    // e imprime a mensagem de resultado no console.
    
    verificarDB();
    // Executa a função de verificação do banco de dados logo na inicialização da aplicação.
    
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.status || 500).json({error: err.message || `Erro Interno`});
    });
    // Middleware de tratamento de erros: captura erros que acontecem nas rotas/middlewares 
    // e retorna uma resposta JSON com o status e a mensagem de erro.

} catch(error){
    console.error(`Problema no App.js, erro:`, error);
    // Caso ocorra algum erro durante a configuração da aplicação, exibe no console.
}

module.exports = app;
// Exporta a instância "app" para ser usada em outro arquivo (ex: index.js ou server.js).


/*
===================================================
================== MIDDLEWARE =====================
Middleware em APIs é uma camada intermediária que processa requisições e respostas HTTP 
antes que cheguem à lógica final do servidor. Ele atua como um "mediador", lidando automaticamente 
com tarefas comuns como autenticação, logging, validação de dados, cache 
limitação de taxa (rate limiting), aumentando a segurança e reutilização de código.

===================================================
================== Função assíncrona ==============
Uma função assíncrona em JavaScript, declarada com async, retorna automaticamente uma Promise
e permite o uso da palavra-chave await dentro dela para pausar a execução até que uma operação assíncrona
(como uma requisição HTTP ou leitura de arquivo) seja concluída. 
Isso torna o código mais legível e síncrono, evitando o "callback hell

Principais Características e Sintaxe:

👀🤷‍♀️ async: Colocada antes da definição da função, garante que ela retorne uma Promise.

👀🤷‍♀️ await: Usado estritamente dentro de funções async, pausa a execução da função até que a Promise seja resolvida ou rejeitada.

👀🤷‍♀️ Tratamento de Erros: Utiliza blocos try...catch para gerenciar erros em operações assíncronas, sendo mais limpo que o .catch(). 

Uma Promise é um objeto em JavaScript que representa o resultado — de sucesso ou falha — de uma operação assíncrona. 
Pense nela como um "recibo" de um processo que começou agora, mas que só entregará o valor final (ou um erro) no futuro. 

Os 3 Estados de uma Promise
Uma Promise sempre estará em um destes três estados: 

🚀Pending (Pendente): Estado inicial, quando a operação ainda está em execução.
🚀Fulfilled (Resolvida): A operação foi concluída com sucesso e retornou um valor.
🚀Rejected (Rejeitada): A operação falhou e retornou um motivo (erro). 

Para lidar com o resultado de uma Promise, utilizamos métodos específicos: 

😊.then(): Executa uma função quando a promessa é resolvida (sucesso).
😒.catch(): Executa uma função quando a promessa é rejeitada (erro).
🤔.finally(): Executa uma função independente do resultado (sucesso ou erro). 

*/











/*
===============================================
============== ROTAS DA AULA ==================

app.get(`/`, (req, res) => //rota principal: (https://localhost/3001:{rota})
    res.send(
        {status: `ok`, message: `Funcionando`}
    )  
);

app.get(`/professores`, (req, res) =>
    res.send(
        {
            nome: `Lucas Sasse`,
            disciplines: [`Logica de Programação`, `Modelagem de Sistemas`]
        }
    )
);

app.get(`/alunos/programacao-de-aplicativos`, (req, res) =>
    res.send(
        {alunos: [`João`, `Daniel`, `Luan`, `Lucas`]}
    )
);

app.get(`/alunos/programacao-de-aplicativos/notas`, (req, res) => 
    res.send(
        {
            alunos: [
                {nome: `Joao`, nota: 7.5},
                {nome: `Daniel`, nota: 9.0},
                {nome: `Lucas`, nota: 8.5},
                {nome: `Luan`, nota: 9.0}                
            ]
        }
    )
);

*/