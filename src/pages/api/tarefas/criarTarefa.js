import db from '@/pages/api/config/connectDB.js';
import buildInsert from '@/pages/api/utils/buildInsert.js';

import defaultResponse from '@/pages/api/config/defaultResponse.js';
import authMiddleware from '../config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        const user = req.user;
        const dadosForm = req.body ?? {};
        const dadosObrigatorios = ['titulo','descricao'];
        const dadosObrigatoriosPreenchidos = dadosObrigatorios.every(dado => dadosForm[dado]);

        if(!dadosObrigatoriosPreenchidos){
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
        }

        dadosForm.id_usuario = user.id;

        const insert = buildInsert('tarefa', dadosForm);
        const tarefa = await db.query({text: insert.text, values: insert.values });

        return res.status(201).json(defaultResponse('Tarefa criada com sucesso', tarefa.rows[0]));

    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
}

export default authMiddleware(handler);