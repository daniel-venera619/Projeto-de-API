const express = require(`express`);
const {pool} = require(`../config/db`);
const router = express.Router();

//==== GET ====

router.get(`/`, async (req, res) => {
    try{
        const [rows] = await pool.execute(`SELECT * FROM clientes`);
        res.json(rows);
        if(rows == 0){
            return res.status(404).json({error: `Não há clientes cadastrados!`});
        }
    }catch(error){
        console.error(`Erro ao consultar clientes: `, error);
        res.status(500).json({error: `Erro ao consultar clientes`, details: error.message});
    }
}
)

module.exports = router;
