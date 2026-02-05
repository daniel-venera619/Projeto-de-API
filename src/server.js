const express = require('express');
const { pool } = require('./config/db'); // importa a pool de conexões com o banco de dados
const app = express();



// Rota GET - / cuponsFiscais
// Retorna todas as linhas e colunas da tabela 'produtos' - SELECT * FROM produtos
app.get('/cuponsFiscais', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cuponsFiscais');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar cuponsFiscais:', error);
    res.status(500).json({ error: 'Erro ao consultar cuponsFiscais', details: error.message });
  }
});


module.server = app