// arquivo de entrada principal e aplicação

require(`dotenv`).config();

const express = require(`express`);
const app = express();

const PORT = process.env.PORTA || 3000;

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});


