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

router.get(`/nomeFantasia/:nomeFantasia`, async (req, res) => {
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

router.delete(`/id/:idCupom/permanente`), async (req, res) => {
    const idCupom = req.params.idCupom;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        if(rows[0] !== 0){
            rows[0] = await pool.execute(`DELETE FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        }
    }catch(error){
        res.status();
    }
}

module.exports = router;