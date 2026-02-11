const express = require(`express`);
const {pool} = require(`../config/db`);
//const {validateCnpj} = require('cpf-cnpj-validator');
const { validator } = require('cpf-cnpj-validator');
const Joi = require('@hapi/joi').extend(validator);
const validateCnpj = Joi.document().cnpj();
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

router.get(`/cnpj/:cpnj`, async (req, res) => {
    const cnpj = req.params.cnpj;
    try{
        const [rows] = await pool.execute(`SELECT * FROM restaurantes WHERE cnpj = ?`, [cnpj]);
        res.json(rows);
        if(rows == 0){
            return res.status(404).json({error: `Esse restaurante não tem cadastrado!`});
        }
    }catch(error){
        console.error(`Erro ao consultar restaurantes: `, error);
        res.status(500).json({error: `Erro ao consultar restaurantes`, details: error.message});
    }
}
)

//==== DELETES ====

router.delete(`/excluir-restaurantes-cnpj/:cnpj/permanente`, async (req, res) => {
    const cnpj = req.params.cnpj;
    try{
        const [rows] = await pool.execute(`SELECT * FROM restaurantes WHERE cnpj = ?`, [cnpj]);
        if(rows.length === 0){
            return res.status(404).json({error: `Restaurante não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM restaurantes WHERE cnpj = ?`, [cnpj]);
        res.json({message: `Restaurante excluido com sucesso!`, id: cnpj});
    }catch(error){
        res.status();
    }
})

router.delete(`/excluir-restaurantes-nome-fantasia/:nomeFantasia/permanente`, async (req, res) => {
    const nomeFantasia = req.params.nomeFantasia;
    try{
        const [rows] = await pool.execute(`SELECT * FROM restaurantes WHERE nomeFantasia = ?`, [nomeFantasia]);
        if(rows.length === 0){
            return res.status(404).json({error: `Restaurante não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM restaurantes WHERE cnpj = ?`, [nomeFantasia]);
        res.json({message: `Restaurante excluido com sucesso!`, id: nomeFantasia});
    }catch(error){
        res.status();
    }
})

// ==== POSTs ====

router.post(`/`, async (req, res) => {
    const {cnpj, nomeFantasia} = req.body;

    //validacao de dados
    if(!nomeFantasia || nomeFantasia.trim() === ``){ //Validacao do nome Fantasia
        return res.status(400).json({
            error: `Nome do Restaurante é Obrigatório!`,
            message: `Forneça um nome fantasia válido!`
        });
    }

    if(nomeFantasia.length > 50){
        return res.status(400).json({
            error: `Nome muito comprido para o Restaurante`,
            message: `Forneça um nome Fantasia válido (máx 50 caracteres)!`
        });
    }

    //Validacao do CNPJ
    if(!cnpj || !validateCnpj.validate(cnpj)){
        return res.status(400).json({
            error: `CNPJ inválido!`,
            message: `Favor inserir o CNPJ corretamente (14 digitos numéricos, apenas!)`
        });
    }

    //Verifica se o CNPJ já existe
    try{
        const[cnpjExistente] = await pool.execute('SELECT * FROM restaurantes WHERE cnpj = ?', [cnpj]);
        if(cnpjExistente.length > 0){
            return res.status(409).json({
                error: `CNPJ já existe!`,
                message: `Já existe um restaurante com esse cnpj: ${cnpj}`
            });
        }

        //se não haver um CNPJ já cadastrado: insere o novo Restaurante
        await pool.execute('INSERT INTO restaurantes (cnpj, nomeFantasia) VALUES (?, ?)', [cnpj, nomeFantasia]);

        const [novoRestaurante] = await pool.execute('SELECT * FROM restaurantes WHERE cnpj = ?', [cnpj]);

        res.status(201).json({
            message: `Restaurante cadastrado com Sucesso!`,
            restaurante: novoRestaurante[0]
        });

    }catch(error){
        console.error(`Erro ao criar Restaurante:`, error);
        res.status(500).json({error: `Erro ao criar Restaurante`, details: error.message});
    }
})

module.exports = router;