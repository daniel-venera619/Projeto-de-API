const express = require(`express`);
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


module.exports = router;