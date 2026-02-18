const express = require(`express`);
// Importa o framework Express para criar o roteador.

const { pool } = require(`../config/db`);
// Importa o objeto "pool" que gerencia a conexão com o banco de dados MySQL.

const { validator } = require('cpf-cnpj-validator');
// Importa o validador de CPF/CNPJ.

const Joi = require('@hapi/joi').extend(validator);
// Importa o Joi (biblioteca de validação) e o estende com o validador de CPF/CNPJ.

// Definição do Schema para Restaurante
const cuponsSchema = Joi.object({
    valor: Joi.number().required(),
    // Valida o Valor

    data: Joi.date().required(),
    // Valida a Data

    cpfCliente: Joi.document().cpf().required().messages({
        'document.cpf': 'O CPF informado é inválido.'
        // Valida que o CPF é obrigatório e segue a regra matemática correta, não aceitando qualquer numero aleatorio.
    }),

    nomeCliente: Joi.string().trim().max(50).required(),
    // Valida nome do cliente com no maximo 50 caracteres

    cnpjRestaurante: Joi.document().cnpj().required(),
    // Valida que o CNPJ seja válido matematicamente e obrigatório.

    nomeFantasia: Joi.string().trim().max(50).required(),
    // Valida que o nome fantasia seja uma string, sem espaços extras, máximo 50 caracteres e obrigatório.

});

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
        res.status(500).json({error: `Erro ao deletar cupom`, details: error});
    }
});

// Excluir por CNPJ do Restaurante
router.delete(`/excluir-cupom-cnpj/:restauranteCNPJ/permanente`, async (req, res) => {
    // AQUI: Limpeza caso o usuário mande CNPJ com pontos/traços na URL
    const cnpjLimpo = req.params.restauranteCNPJ.replace(/\D/g, '');
    
    try {
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE restauranteCNPJ = ?`, [cnpjLimpo]);
        if (rows.length === 0) {
            return res.status(404).json({error: `Nenhum cupom encontrado para este CNPJ!`});
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE restauranteCNPJ = ?`, [cnpjLimpo]);
        res.json({ message: `Todos os cupons do restaurante foram excluidos!`, cnpj: cnpjLimpo });
    } catch (error) {
        res.status(500).json({error: `Erro ao deletar cupons por CNPJ`, details: error});
    }
});

// Excluir por CPF do Cliente
router.delete(`/excluir-cupom-cpf/:clientesCPF/permanente`, async (req, res) => {
    const clientesCPF = req.params.clientesCPF;
    try{
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE clientesCpf = ?`, [clientesCPF]);
        if(rows.length === 0){
            return res.status(404).json({error: `Nenhum cupom encontrado para este CPF!`});
        }
        await pool.execute(`DELETE FROM cuponsFiscais WHERE clientesCpf = ?`, [clientesCPF]);
        res.json({message: `Cupom excluido com sucesso!`, id: clientesCPF});
    } catch (error) {
        res.status(500).json({error: `Erro ao deletar cupons por CNPJ`, datails: error});
    }
})

//==== POST ====

// Cadastrar novo cupom
router.post(`/`, async (req, res) => { //FALTA FAZER A DATA
    // Limpeza do CNPJ
    req.body.cnpjRestaurante = String(req.body.cnpjRestaurante || '').replace(/\D/g, '');

    // Limpeza do CPF
    req.body.cpfCliente = String(req.body.cpfCliente || '').replace(/\D/g, '');

    //Limpeza do Valor
    //req.body.valor = parseFloat(req.body.valor).toFixed(2).replace(",", ".");

    // Validação com o schema
    const { error, value } = cuponsSchema.validate(req.body);

    if (error) {
        console.log(error);
        return res.status(400).json({
            error: `Dados inválidos!`,
            message: "CNPJ/CPF inválido ou Nome Fantasia fora do padrão."
        });
    }

    const { valor, data, cpfCliente, nomeCliente, cnpjRestaurante, nomeFantasia } = value;

    try {
        const[cnpjCadastrado] = await pool.execute(`SELECT * FROM restaurantes WHERE cnpj = ?`, [cnpjRestaurante]);
        if(cnpjCadastrado.length === 0){
            return res.status(404).json({ error: `Esse Restaurante não está cadastrado! Não é possível cadastrar Cupom` });
        }

        const [nomeFantasiaCNPJ] = await pool.execute(`SELECT nomeFantasia FROM restaurantes WHERE cnpj = ?`, [cnpjRestaurante]);
        if (nomeFantasiaCNPJ[0].nomeFantasia != nomeFantasia) {
            //console.log({pesquisa: nomeFantasiaCNPJ[0].nomeFantasia, entrada: nomeFantasia});
            return res.status(404).json({ error: `Esse Restaurante possui outro nome cadastrado! Informe o Nome Fantasia correto para cadastrar o Cupom` });
            
        }

        const [cpfCadastrado] = await pool.execute(`SELECT * FROM clientes WHERE cpf = ?`, [cpfCliente]);
        if (cpfCadastrado.length === 0) {
            return res.status(404).json({ error: `Esse Cliente não está cadastrado! Não é possível cadastrar Cupom` });
        }

        const [nomeClienteCPF] = await pool.execute(`SELECT nome FROM clientes WHERE cpf = ?`, [cpfCliente]);
        if (nomeClienteCPF[0].nome !== nomeCliente) {
            //console.log({pesquisa: nomeClienteCPF[0].nomeCliente, entrada: nomeCliente});
            return res.status(404).json({ error: `Esse Cliente possui outro nome cadastrado! Informe o Nome correto para cadastrar o Cupom` });
        }

        //res.status(200).json({message: `Dados compatíveis para cadastro de Cupom Fiscal`});

    } catch (error) {
        res.status(500).json({error: `Erro ao consultar os Dados dos Clientes e Restaurantes para cadastrar o cupom`, details: error});
    }

    try {
        //console.log(`Chegou no segundo Try para cadastro!`)
        // Insere novo cupom
        const query = 'INSERT INTO cuponsFiscais (valorTotal, dataCompra, clientesNome, clientesCpf, restaurantesNome, restaurantesCNPJ) VALUES (?, ?, ?, ?, ?, ?)';
        await pool.execute(query, [valor, data, nomeCliente, cpfCliente, nomeFantasia, cnpjRestaurante]);
        //console.log(`Chegou a Executar o Insert into`)
        
        res.status(201).json({ message: `Cupom Fiscal cadastrado com Sucesso!`, cupom: { valor, data, nomeCliente, cpfCliente, nomeFantasia, cnpjRestaurante } });

    } catch (error) {
        res.status(500).json({ error: `Erro ao cadastrar Cupom Fiscal`, details: error.message });
    }
});

//=== PUTs ====

router.put(`/atualizar-cupom/:idCupom`, async (req, res) => {
    const idCupom = req.params.idCupom;

    if(req.body === undefined){
        res.status(400).json({message: `Nenhum campo para atualizar informado!`});
    }

    const { valor, data, cpfCliente, nomeCliente, cnpjRestaurante, nomeFantasia } = req.body;

    const campos = [];
    const valores = [];

    // Limpeza do CNPJ
    req.body.cnpjRestaurante = String(req.body.cnpjRestaurante || '').replace(/\D/g, '');

    // Limpeza do CPF
    req.body.cpfCliente = String(req.body.cpfCliente || '').replace(/\D/g, '');

    // Validação com o schema
    const { error } = cuponsSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: `Dados inválidos!`,
            message: "Dado(s) sensível(eis) inválido(s) ou Nome Fantasia fora do padrão."
        });
    }

    try {
        const [rows] = await pool.execute(`SELECT * FROM cuponsFiscais WHERE idCupom = ?`, [idCupom]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Cupom não encontrado!` });
        }
    }catch (error) {
        res.status(500).json({ error: `Erro ao consultar cupom para atualização`, details: error });
    }

    try{

        if(valor !== undefined) {
            campos.push(`valorTotal = ?`);
            valores.push(valor);
        }
        if(data !== undefined) {
            campos.push(`dataCompra = ?`);
            valores.push(data);
        }
        if(cpfCliente !== undefined) {
            campos.push(`clientesCpf = ?`);
            valores.push(cpfCliente);
        }
        if(nomeCliente !== undefined) {
            campos.push(`clientesNome = ?`);
            valores.push(nomeCliente);
        }
        if(cnpjRestaurante !== undefined) {
            campos.push(`restaurantesCNPJ = ?`);
            valores.push(cnpjRestaurante);
        }
        if(nomeFantasia !== undefined) {
            campos.push(`restaurantesNome = ?`);
            valores.push(nomeFantasia);
        }

        if(campos.length === 0) {
            return res.status(400).json({ error: `Nenhum campo para atualizar informado.` });
        }
    }catch(error){
        res.status(400).json({error: `Erro ao colocar valores e campos nas listas`, details: error});
    }

    valores.push(idCupom); // Para o WHERE
    const sql = `UPDATE cuponsFiscais SET ${campos.join(', ')} WHERE idCupom = ?`;

    try {
        await pool.execute(sql, valores);
        res.json({ message: `Cupom Fiscal atualizado com sucesso!` });
    } catch (error) {
        res.status(500).json({ error: `Erro ao atualizar Cupom Fiscal`, details: error.message });
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



//==== POSTs ====


module.exports = router;*/