const express = require(`express`);
// Importa o framework Express para criar o servidor e gerenciar rotas.

const app = express();
// Cria uma instância do Express. Essa instância será usada para configurar o servidor.

const clientesRoutes = require(`./routes/clientes`);
// Importa o módulo de rotas específico para "clientes" (arquivo localizado em routes/clientes.js).

const cuponsRoutes = require(`./routes/cupons`);
// Importa o módulo de rotas específico para "cupons" (arquivo localizado em routes/cupons.js).

const restaurantesRoutes = require(`./routes/restaurantes`);
// Importa o módulo de rotas específico para "restaurantes" (arquivo localizado em routes/restaurantes.js).

app.use(`/clientes`, clientesRoutes);
// Define que todas as rotas do módulo "clientesRoutes" estarão acessíveis a partir do caminho base "/clientes".

app.use(`/cupons`, cuponsRoutes);
// Define que todas as rotas do módulo "cuponsRoutes" estarão acessíveis a partir do caminho base "/cupons".

app.use(`/restaurantes`, restaurantesRoutes);
// Define que todas as rotas do módulo "restaurantesRoutes" estarão acessíveis a partir do caminho base "/restaurantes".

module.exports = app;
// Exporta a instância "app" para que possa ser usada em outro arquivo (ex: server.js) onde o servidor será iniciado.









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