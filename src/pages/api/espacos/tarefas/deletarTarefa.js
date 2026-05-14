import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json(defaultResponse('Método não permitido'));
    }

    try {
        const { id } = req.query ?? {};

        if (!id) {
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
        }

        const tarefaExistente = await db.query({text: 'SELECT 1 FROM tarefa WHERE id = $1', values: [id]});

        if(tarefaExistente.rowCount !== 1){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const hasFiles = await db.query({ text: 'SELECT 1 FROM tarefa_arquivo WHERE id_tarefa = $1', values:[id] });

        if(hasFiles.rowCount > 0){
            return res.status(409).json(defaultResponse('Delete os arquivos antes de deletar as tarefas'));
        }

        const sql = `
            DELETE FROM tarefa
            WHERE id = $1
            RETURNING *
        `;

        const tarefa = await db.query({ text: sql, values: [id] });

        if (tarefa.rowCount === 0) {
            return res.status(404).json(defaultResponse('Tarefa não encontrada!'));
        }

        return res.status(200).json(defaultResponse('Tarefa deletada com sucesso', tarefa.rows[0]));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);
