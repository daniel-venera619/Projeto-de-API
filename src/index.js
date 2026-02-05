// arquivo de entrada principal da aplicação

require(`dotenv`).config();

//const express = require('express');
const app = require('./app');
//const app = express();

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});

