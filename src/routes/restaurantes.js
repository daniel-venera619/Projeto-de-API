const express = require(`express`);
const {pool} = require(`../config/db`);
const router = express.Router();

//==== GET ====

router.get(`/`, async (req, res) => {
    try{
        const [rows] = await pool.execute(`SELECT * FROM restaurantes`);
        res.json(rows);
        if(rows == 0){
            return res.status(404).json({error: `Não há restaurantes cadastrados!`});
        }
    }catch(error){
        console.error(`Erro ao consultar restaurantes: `, error);
        res.status(500).json({error: `Erro ao restaurantes`, details: error.message});
    }
}
)

module.exports = router;