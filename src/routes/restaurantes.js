const express = require(`express`);
const {pool} = require(`../config/db`);
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

// ==== PUT ====

router.put(`/:cnpj`, async (req, res) => {
    const cnpjRest = req.params.cnpj;

    const { cnpj, nomeFantasia } = req.body;

    try{
        const [restauranteExistente] = await pool.execute('SELECT * FROM restaurantes WHERE cnpj = ?', [cnpjRest]);
        if(restauranteExistente.length === 0){
            res.status(404).json({error: "Restaurante não cadastrado!"});
        }

        if(cnpj !== undefined){
            if(!cnpj || !validateCnpj.validate(cnpj)){
                return res.status(400).json({
                    error: "Forneça um CNPJ válido"
                });
            }
        }

        if(nomeFantasia !== undefined){
            if(!nomeFantasia || nomeFantasia.trim() === ""){
                return res.status(400).json({
                    error: "Forneça um Nome Fantasia Válido!"
                })
            }

            const [nomeFantasiaExistente] = await pool.execute('SELECT * FROM restaurantes WHERE nomeFantasia = ?', [nomeFantasia]);
            if(nomeFantasiaExistente.length === 1){
                const [nomeFantasiaOwner] = await pool.execute('SELECT cnpj FROM restaurante WHERE nomeFantasia = ?', [nomeFantasiaExistente]);
                return res.status(400).json({
                    error: "Nome Fantasia já em uso por outro restaurante! Forneça um diferente.",
                    message: `O Restaurante a qual o nome pertence é o: ${nomeFantasiaOwner} `
                });
            }
        }

        const campos = [];
        const valores = [];

        if(cnpj !== undefined){
            campos.push('cnpj = ?');
            valores.push(cnpj);
        }

        if(nomeFantasia !== undefined){
            campos.push('nomeFantasia = ?');
            valores.push(nomeFantasia);
        }

        if(valores.length === 0){
            res.status(400).json({
                error: "Nenhum campo para se atualizar",
                message: "Se quiser atualizar, insira ao menos UM campo"
            });
        }

        const update = await pool.execute(`UPDATE restaurantes SET ${campos.join(', ')} WHERE cnpj = ?`)
        const [result] = await pool.execute(update, cnpjRest);

        if(result.length === 0){
            res.status(400).json({
                error: "Restaurante não encontrado"
            });
        }

        res.json({
            message: "Restaurante atualizado com sucesso!",
            restaurante: valores[1],
            campos: campos.length
        });

    }catch(error){
        console.error(`Erro ao Atualizar Restaurante:`, error);
        res.status(500).json({error: `Erro ao atualizar Restaurante`, details: error.message});
    }

})
module.exports = router;