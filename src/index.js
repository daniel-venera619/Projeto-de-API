// arquivo de entrada principal e aplicação

require('dotenv').config();
// Carrega variáveis de ambiente do arquivo .env para process.env. 
// Isso permite configurar coisas como PORT, credenciais, etc., sem expor no código.

const app = require('./app');
// Importa a instância do Express configurada no arquivo app.js (com as rotas já definidas).

const PORT = process.env.PORT || 3001;
// Define a porta do servidor. Primeiro tenta usar a variável de ambiente PORT. 
// Se não existir, usa a porta padrão 3001.

try{
    app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
    // Inicia o servidor na porta definida e exibe mensagem no console confirmando.
    });
    
}catch(error){
    console.error(`Erro ao inicar o Server:`, error);
    // Caso ocorra algum erro ao iniciar o servidor, mostra a mensagem de erro no console.
}
