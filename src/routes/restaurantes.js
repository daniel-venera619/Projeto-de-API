const express = require(`express`);
// Importa o framework Express para criar o roteador.

const { pool } = require(`../config/db`);
// Importa o objeto "pool" que gerencia a conexão com o banco de dados MySQL.

const { validator } = require('cpf-cnpj-validator');
// Importa o validador de CPF/CNPJ.

const Joi = require('@hapi/joi').extend(validator);
// Importa o Joi (biblioteca de validação) e o estende com o validador de CPF/CNPJ.

// Definição do Schema para Restaurante
const restauranteSchema = Joi.object({
    nomeFantasia: Joi.string().trim().max(50).required(),
    // Valida que o nome fantasia seja uma string, sem espaços extras, máximo 50 caracteres e obrigatório.

    cnpj: Joi.document().cnpj().required()
    // Valida que o CNPJ seja válido matematicamente e obrigatório.
});

const router = express.Router();
// Cria um roteador do Express para organizar as rotas de "restaurantes".

//==== GET ====

// Rota para listar todos os restaurantes
router.get(`/`, async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT * FROM restaurantes`);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Não há restaurantes cadastrados!` });
        }
        res.json(rows);
    } catch (error) {
        console.error(`Erro ao consultar restaurantes: `, error);
        res.status(500).json({ error: `Erro ao consultar restaurantes`, details: error.message });
    }
});

// Rota para buscar restaurante pelo CNPJ
router.get(`/cnpj/:cnpj`, async (req, res) => {
    const cnpj = req.params.cnpj;
    try {
        const [rows] = await pool.execute(`SELECT * FROM restaurantes WHERE cnpj = ?`, [cnpj]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Esse restaurante não está cadastrado!` });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: `Erro ao consultar restaurante`, details: error.message });
    }
});

//==== DELETES ====

// Excluir restaurante pelo CNPJ
router.delete(`/excluir-restaurantes-cnpj/:cnpj/permanente`, async (req, res) => {
    const cnpj = req.params.cnpj;
    try {
        const [rows] = await pool.execute(`SELECT * FROM restaurantes WHERE cnpj = ?`, [cnpj]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Restaurante não foi encontrado!` });
        }
        await pool.execute(`DELETE FROM restaurantes WHERE cnpj = ?`, [cnpj]);
        res.json({ message: `Restaurante excluido com sucesso!`, cnpj: cnpj });
    } catch (error) {
        res.status(500).json({ error: "Erro ao excluir restaurante" });
    }
});

// ==== POST (Cadastro) ====

// Cadastrar novo restaurante
router.post(`/`, async (req, res) => {
    // Limpeza do CNPJ
    if (req.body.cnpj) {
        req.body.cnpj = String(req.body.cnpj).replace(/\D/g, '');
    }

    // Validação com o schema
    const { error, value } = restauranteSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: `Dados inválidos!`,
            message: "CNPJ inválido ou Nome Fantasia fora do padrão."
        });
    }

    const { cnpj, nomeFantasia } = value;

    try {
        // Verifica se o CNPJ já existe
        const [cnpjExistente] = await pool.execute('SELECT * FROM restaurantes WHERE cnpj = ?', [cnpj]);
        if (cnpjExistente.length > 0) {
            return res.status(409).json({ error: `CNPJ já existe!`, message: `Já existe um restaurante com o cnpj: ${cnpj}` });
        }

        // Insere novo restaurante
        await pool.execute('INSERT INTO restaurantes (cnpj, nomeFantasia) VALUES (?, ?)', [cnpj, nomeFantasia]);
        res.status(201).json({ message: `Restaurante cadastrado com Sucesso!`, restaurante: { cnpj, nomeFantasia } });

    } catch (error) {
        res.status(500).json({ error: `Erro ao criar Restaurante`, details: error.message });
    }
});

// ==== PUT (Atualização) ====


// Atualizar restaurante existente
router.put(`/:cnpjAtual`, async (req, res) => {
    const cnpjUrl = req.params.cnpjAtual;
    const { cnpj, nomeFantasia } = req.body;

    try {
        // Verifica se restaurante existe
        const [existe] = await pool.execute('SELECT * FROM restaurantes WHERE cnpj = ?', [cnpjUrl]);
        if (existe.length === 0) return res.status(404).json({ error: "Restaurante não encontrado!" });

        const campos = [];
        const valores = [];

        // Validação e limpeza do novo CNPJ (se enviado)
        if (cnpj !== undefined) {
            const cnpjLimpo = String(cnpj).replace(/\D/g, '');
            const { error } = Joi.document().cnpj().validate(cnpjLimpo);
            if (error) return res.status(400).json({ error: "Novo CNPJ informado é inválido!" });
            
            campos.push('cnpj = ?');
            valores.push(cnpjLimpo);
        }

        // Validação do nomeFantasia (se enviado)
        if (nomeFantasia !== undefined) {
            if (nomeFantasia.trim() === "" || nomeFantasia.length > 50) {
                return res.status(400).json({ error: "Nome Fantasia inválido!" });
            }
            campos.push('nomeFantasia = ?');
            valores.push(nomeFantasia.trim());
        }

        if (campos.length === 0) {
            return res.status(400).json({ error: "Nenhum campo para atualizar informado." });
        }

        valores.push(cnpjUrl); // Para o WHERE
        const sql = `UPDATE restaurantes SET ${campos.join(', ')} WHERE cnpj = ?`;
        
        await pool.execute(sql, valores);
        res.json({ message: "Restaurante atualizado com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Erro ao atualizar`, details: error.message });
    }
});

module.exports = router;
// Exporta o roteador para ser usado no app principal.


/*
===========================================================
==========Alterações do codigom para validdar CPF==========

O problema é exatamente o mesmo: o Joi retorna um objeto no método .validate(),
o que faz com que sua condição de erro seja sempre considerada verdadeira, 
e falta a limpeza de caracteres especiais (pontos, barras e traços).


O que foi Alterado :

🚀1. Lógica do CNPJ: Removido o validateCnpj.validate(cnpj) de dentro do if direto, pois ele sempre retornava verdadeiro.
Agora usamos o restauranteSchema.validate().

🚀2. Limpeza (replace): Adicionei o tratamento para remover pontos, barras e traços do CNPJ tanto no POST quanto no PUT.

🚀3. Erro no UPDATE: No seu código original, você passava update (que era o resultado do execute) dentro de outro execute.
Agora o SQL é montado corretamente e os valores são passados no array valores.
Parâmetros da URL: No PUT, alterei o nome do parâmetro para cnpjAtual para não confundir com o cnpj novo que vem no corpo da requisição.

*/






/*const express = require(`express`);
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
module.exports = router;*/