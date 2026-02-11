const express = require(`express`);
const {pool} = require(`../config/db`);
const validateCpf = require('validar-cpf');
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

router.get(`/cpf/:cpf`, async (req, res) => {
    const cpf = req.params.cpf;
    try{
        const [rows] = await pool.execute(`SELECT * FROM clientes WHERE cpf = ?`, [cpf]);
        res.json(rows);
        if(rows == 0){
            return res.status(404).json({error: `Esse cliente não tem cadastrado!`});
        }
    }catch(error){
        console.error(`Erro ao consultar clientes: `, error);
        res.status(500).json({error: `Erro ao consultar clientes`, details: error.message});
    }
}
)

//==== DELETES ====

router.delete(`/excluir-clientes-cpf/:cpf/permanente`, async (req, res) => {
    const cpf = req.params.cpf;
    try{
        const [rows] = await pool.execute(`SELECT * FROM clientes WHERE cpf = ?`, [cpf]);
        if(rows.length === 0){
            return res.status(404).json({error: `Cliente não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM clientes WHERE cpf = ?`, [cpf]);
        res.json({message: `Cliente excluido com sucesso!`, id: cpf});
    }catch(error){
        res.status();
    }
})

router.delete(`/excluir-cliente-nome/:nomeCliente/permanente`, async (req, res) => {
    const nome = req.params.nomeCliente;
    try{
        const [rows] = await pool.execute(`SELECT * FROM clientes WHERE nome = ?`, [nome]);
        if(rows.length === 0){
            return res.status(404).json({error: `Cliente não foi encontrado!`});
        }
        await pool.execute(`DELETE FROM clientes WHERE nome = ?`, [nome]);
        res.json({message: `Cliente excluido com sucesso!`, id: nome});
    }catch(error){
        res.status();
    }
})

//==== POSTs ====

router.post(`/`, async (req, res) => {
    const {cpf, nome} = req.body;

    //validacao de dados
    if(!nome || nome.trim() === ``){ //Validacao do nome
        return res.status(400).json({
            error: `Nome do Cliente é Obrigatório!`,
            message: `Forneça um nome válido!`
        });
    }

    if(nome.length > 50){
        return res.status(400).json({
            error: `Nome muito comprido Dom Pedro I`,
            message: `Se você não for Dom Pedro I, favor colocar nome de gente!`
        });
    }

    //Validacao do CPF
    if(!cpf || !validateCpf(cpf)){
        return res.status(400).json({
            error: `CPF inválido!`,
            message: `Favor inserir o CPF corretamente (11 digitos numéricos, apenas!)`
        });
    }

    //Verifica se o CPF já existe
    try{
        const[cpfExistente] = await pool.execute('SELECT * FROM clientes WHERE cpf = ?', [cpf]);
        if(cpfExistente.length > 0){
            return res.status(409).json({
                error: `CPF já existe!`,
                message: `Já existe um cliente com esse cpf: ${cpf}`
            });
        }

        //se não haver um CPF já cadastrado: insere o novo Cliente
        await pool.execute('INSERT INTO clientes (cpf, nome) VALUES (?, ?)', [cpf, nome]);

        const [novoCliente] = await pool.execute('SELECT * FROM clientes WHERE cpf = ?', [cpf]);

        res.status(201).json({
            message: `Cliente cadastrado com Sucesso!`,
            cliente: novoCliente[0]
        });

    }catch(error){
        console.error(`Erro ao criar Cliente:`, error);
        res.status(500).json({error: `Erro ao criar cliente`, details: error.message});
    }
})

module.exports = router;
