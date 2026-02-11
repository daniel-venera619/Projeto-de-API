const express = require(`express`);
const app = express();

const clientesRoutes = require(`./routes/clientes`);
const cuponsRoutes = require(`./routes/cupons`);
const restaurantesRoutes = require(`./routes/restaurantes`);

app.use(`/clientes`, clientesRoutes);
app.use(`/cupons`, cuponsRoutes);
app.use(`/restaurantes`, restaurantesRoutes);

module.exports = app;

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