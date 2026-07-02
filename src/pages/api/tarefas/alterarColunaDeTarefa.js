import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: true,
};

const handler = async (req, res) => {
    try {
        const dadosForm = req.body ?? {};
        const requiredData = {
            id: 'ID',
            id_coluna: 'Coluna',
        };
        const data = {};
        const { id, id_coluna } = dadosForm;

        for(const requiredKey in requiredData){
            if(!dadosForm[requiredKey]){
                console.log('chave faltante: ', requiredKey);
                return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
            }
            data[requiredKey] = dadosForm[requiredKey];
        }

        const tarefaExistente = await db.query({
            text: `
                SELECT t.*
                FROM tarefa t
                WHERE t.id = $1
            `,
            values: [data.id]
        });

        if(tarefaExistente.rowCount !== 1){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: tarefaExistente.rows[0].id_espaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
            dbClient: db
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para editar tarefas neste espaço!'));
        }

        const colunaValidaResult = await db.query({
            text: `
                SELECT *
                FROM coluna
                WHERE id = $1 AND id_espaco = $2
            `,
            values: [data.id_coluna, tarefaExistente.rows[0].id_espaco]
        });

        if (colunaValidaResult.rowCount === 0) {
            return res.status(400).json(defaultResponse('Coluna não encontrada!'));
        }

        const colunaValida = colunaValidaResult.rows[0];

        if(colunaValida.id === tarefaExistente.rows[0].id_coluna){
            return res.status(400).json(defaultResponse('A tarefa já está nesta coluna!'));
        }

        if (colunaValida.ativo === false) {
            return res.status(400).json(defaultResponse('Ative a coluna para ela receber a tarefa!'));
        }

        const sql = `
            UPDATE tarefa
            SET id_coluna = $1, data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

        const tarefa = await db.query({ text: sql, values: [data.id_coluna, data.id] });

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
