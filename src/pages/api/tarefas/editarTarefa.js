import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '../config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        const user = req.user;
        const dadosForm = req.body ?? {};
        const { id, titulo, descricao } = dadosForm;

        if (!id || !titulo || !descricao) {
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
        }

        const tarefaExistente = await db.query({text: 'SELECT 1 FROM tarefa WHERE id = $1 AND id_usuario = $2', values: [id, user.id]});

        if(tarefaExistente.rowCount !== 1){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const sql = `
            UPDATE tarefa
            SET titulo = $1,
                descricao = $2,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;

        const tarefa = await db.query({ text: sql, values: [titulo, descricao, id] });

        if (tarefa.rowCount === 0) {
            return res.status(404).json(defaultResponse('Tarefa não encontrada!'));
        }

        return res.status(200).json(defaultResponse('Tarefa atualizada com sucesso', tarefa.rows[0]));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);
