const express = require(`express`);
// Importa o framework Express para criar o roteador.

const { pool } = require(`../config/db`);
// Importa o objeto "pool" que gerencia a conexão com o banco de dados MySQL.

const router = express.Router();
// Cria um roteador do Express para organizar as rotas de "cupons fiscais".


//==== GETS ====

// Rota para listar todos os cupons fiscais
router.get(`/`, async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais`);
        // Executa consulta SQL para buscar todos os cupons.

        if (rows.length === 0) {
            return res.status(404).json({ error: `Não há cupons cadastrados!` });
        }
        res.json(rows);
    } catch (error) {
        console.error(`Erro ao consultar Cupons Fiscais: `, error);
        res.status(500).json({ error: `Erro ao Consultar Cupons`, details: error.message });
    }
});

// Rota para buscar cupons por nome do cliente
router.get(`/nome-cliente/:nome`, async (req, res) => {
    const nomeCliente = req.params.nome;
    try {
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE clientesNome LIKE ?`, [`%${nomeCliente}%`]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Não há cupons para o cliente: ${nomeCliente}` });
        }
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: `Erro na busca por nome`, details: error.message });
    }
});

//==== DELETES ====

// Excluir por ID do Cupom
router.delete(`/excluir-cupom-id/:idCupom/permanente`, async (req, res) => {
    const idCupom = req.params.idCupom;
    try {
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Cupom não foi encontrado!` });
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        res.json({ message: `Cupom excluido com sucesso!`, id: idCupom });
    } catch (error) {
        res.status(500).json({ error: `Erro ao deletar cupom` });
    }
});

// Excluir por CNPJ do Restaurante
router.delete(`/excluir-cupom-cnpj/:restauranteCNPJ/permanente`, async (req, res) => {
    // AQUI: Limpeza caso o usuário mande CNPJ com pontos/traços na URL
    const cnpjLimpo = req.params.restauranteCNPJ.replace(/\D/g, '');
    
    try {
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE restauranteCNPJ = ?`, [cnpjLimpo]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Nenhum cupom encontrado para este CNPJ!` });
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE restauranteCNPJ = ?`, [cnpjLimpo]);
        res.json({ message: `Todos os cupons do restaurante foram excluidos!`, cnpj: cnpjLimpo });
    } catch (error) {
        res.status(500).json({ error: `Erro ao deletar cupons por CNPJ` });
    }
});

module.exports = router;
// Exporta o roteador para ser usado no app principal.

/*
============================================================
O que mudou:

🚀1. Correção do LIKE: Mudei de LIKE '%?%' para LIKE ? e passei [%${nomeCliente}%] no array. O banco de dados não consegue
ler o ponto de interrogação se ele estiver dentro de aspas simples.

🚀2. Remoção do rows[0] no GET: Antes estava retornando apenas um cupom (res.json(rows[0])). 
Agora ele retorna a lista de todos os cupons encontrados para aquele cliente ou restaurante.

🚀3. Tratamento de Erros: Substituí os res.status(); vazios por res.status(500).json(...). Isso evita que o Node.
js feche sozinho se o banco der erro.

🚀4.Limpeza no DELETE: Adicionei o .replace(/\D/g, '') na rota de exclusão por CNPJ. Assim, 
se você digitar http://localhost:3001/cupons/excluir-cupom-cnpj/11.222.333/0001-00/permanente no Postman,
o sistema vai entender e apagar corretamente.

Testando no Postman:

DELETE http://localhost:3001/cupons/excluir-cupom-id/VALOR_DO_ID/permanente

*/



/*const express = require(`express`);
const {pool} = require(`../config/db`);
const router = express.Router();

//==== GET ====

router.get(`/`, async (req, res) => {
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais`);
        res.json(rows);
        if(rows == 0){
            return res.status(404).json({error: `Não há cupons cadastrados!`});
        }
    }catch(error){
        console.error(`Erro ao consultar Cupons Fiscais: `, error);
        res.status(500).json({error: `Erro ao Consultar Cupons`, details: error.message});
    }
}
)

router.get(`/cpf/:cpf`, async (req, res) => {
    const clientesCpf = req.params.cpf;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE clientesCpf = ?`, [clientesCpf]);
        if(rows.length === 0){
            return res.status(404).json({error: `Não há cupons cadastrados desse cliente!`});
        }
        res.json(rows[0]);
    }catch(error){
        console.error(`Erro ao consultar Cupons Fiscais do cliente.`, error);
        res.status(500).json({error: `Erro ao Consultar Cupons do cliente.`, details: error.message});
    }
}
)

router.get(`/nome-cliente/:nome`, async (req, res) => {
    const nomeCliente = req.params.nome;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE clientesNome LIKE '%?%'`, [nomeCliente]);
        if(rows.length === 0){
            return res.status(404).json({error: `Não há cupons cadastrados desse cliente!`});
        }
        res.json(rows[0]);
    }catch(error){
        console.error(`Erro ao consultar Cupons Fiscais do cliente.`, error);
        res.status(500).json({error: `Erro ao Consultar Cupons do cliente.`, details: error.message});
    }
}
)

router.get(`/cnpj/:cnpj`, async (req, res) => {
    const restaurantesCNPJ = req.params.cnpj;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE restaurantesCNPJ = ?`, [restaurantesCNPJ]);
        if(rows.length === 0){
            return res.status(404).json({error: `Não há cupons cadastrados desse Restaurante!`});
        }
        res.json(rows[0]);

    }catch(error){
        console.error(`Erro ao consultar Cupons Fiscais do restaurante.`, error);
        res.status(500).json({error: `Erro ao Consultar Cupons Fiscais do restaurante.`, details: error.message});
    }
}
)

router.get(`/nome-fantasia/:nomeFantasia`, async (req, res) => {
    const nomeFantasia = req.params.nomeFantasia;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE restaurantesNome LIKE '%?%'`, [nomeFantasia]);
        if(rows.length === 0){
            return res.status(404).json({error: `Não há cupons cadastrados nesse nome de Restaurante!`});
        }
        res.json(rows[0]);
    }catch(error){
        console.error(`Erro ao consultar cupons nesse nome de Restaurante.`, error);
        res.status(500).json({error: `Erro ao Consultar cupons nesse nome de Restaurante.`, details: error.message});
    }
}
)

//==== DELETES ====

router.delete(`/excluir-cupom-id/:idCupom/permanente`, async (req, res) => {
    const idCupom = req.params.idCupom;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        if(rows.length === 0){
            return res.status(404).json({error: `Cupom não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        
        res.json({message: `Cupom excluido com sucesso!`, id: idCupom});
    }catch(error){
        console.error(`Erro ao deletar cupom por id:`, error);
    }
})

router.delete(`/excluir-cupom-cnpj/:restauranteCNPJ/permanente`, async (req, res) => {
    const restauranteCNPJ = req.params.restauranteCNPJ;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE restauranteCNPJ = ?`, [restauranteCNPJ]);
        if(rows.length === 0){
            return res.status(404).json({error: `Cupom não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE restauranteCNPJ = ?`, [restauranteCNPJ]);
        res.json({message: `Cupom excluido com sucesso!`, id: restauranteCNPJ});
    }catch(error){
        res.status();
    }
})

router.delete(`/excluir-cupom-cpf/:clientesCPF/permanente`, async (req, res) => {
    const clientesCPF = req.params.clientesCPF;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE clientesCpf = ?`, [clientesCPF]);
        if(rows.length === 0){
            return res.status(404).json({error: `Cupom não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE clientesCpf = ?`, [clientesCPF]);
        res.json({message: `Cupom excluido com sucesso!`, id: clientesCPF});
    }catch(error){
        res.status();
    }
})

//==== POSTs ====


module.exports = router;*/