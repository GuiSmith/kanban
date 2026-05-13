import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import buildImgSrc from '@/pages/api/utils/buildImgSrc';
import authMiddleware from '../../config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json(defaultResponse('Método não permitido'));
        }

        const user = req.user;

        const idTarefaRaw = req.query?.id_tarefa;
        if (!idTarefaRaw) {
            return res.status(400).json(defaultResponse('Informe a tarefa!'));
        }

        const idTarefa = Number(idTarefaRaw);
        if (!Number.isInteger(idTarefa) || idTarefa <= 0) {
            return res.status(400).json(defaultResponse('Tarefa inválida!'));
        }

        const tarefa = await db.query({
            text: 'SELECT id FROM tarefa WHERE id = $1 AND id_usuario = $2',
            values: [idTarefa,user.id],
        });

        if (!tarefa || tarefa.rowCount === 0) {
            return res.status(404).json(defaultResponse('Tarefa não encontrada!'));
        }

        const arquivos = await db.query({
            text: 'SELECT * FROM tarefa_arquivo WHERE id_tarefa = $1 ORDER BY id ASC',
            values: [idTarefa],
        });

        if(!arquivos){
            return res.status(400).json(defaultResponse('Erro ao buscar tarefas no banco de dados'));
        }

        const data = arquivos.rows.map(row => {
            row.src = buildImgSrc(row.public_url);
            delete row.public_url;

            return row;
        });

        return res.status(200).json(defaultResponse('Segue arquivos', data));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);
