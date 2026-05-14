import db from '@/pages/api/config/connectDB.js';
import buildInsert from '@/pages/api/utils/buildInsert.js';

import defaultResponse from '@/pages/api/config/defaultResponse.js';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        const dadosForm = req.body ?? {};
        const dadosObrigatorios = ['titulo','descricao','id_espaco'];
        const dadosObrigatoriosPreenchidos = dadosObrigatorios.every(dado => dadosForm[dado]);

        if(!dadosObrigatoriosPreenchidos){
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
        }

        const insert = buildInsert('tarefa', dadosForm);
        const tarefa = await db.query({text: insert.text, values: insert.values });

        return res.status(201).json(defaultResponse('Tarefa criada com sucesso', tarefa.rows[0]));

    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
}

export default authMiddleware(handler);