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
            titulo: 'título',
            descricao: 'descrição',
            id_espaco: 'espaço',
        };
        const data = {};
        const { id, titulo, descricao, id_espaco } = dadosForm;

        for(const requiredKey in requiredData){
            if(!dadosForm[requiredKey]){
                console.log('chave faltante: ', requiredKey);
                return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
            }
            data[requiredKey] = dadosForm[requiredKey];
        }

        const idEspaco = Number(data.id_espaco);
        if(!Number.isInteger(Number(data.id)) || !Number.isInteger(idEspaco) || idEspaco <= 0){
            return res.status(400).json(defaultResponse('ID inválido'));
        }

        const tarefaExistente = await db.query({
            text: `
                SELECT t.id
                FROM tarefa t
                JOIN espaco e ON e.id = t.id_espaco
                WHERE t.id = $1 AND e.id = $2
            `,
            values: [data.id, idEspaco]
        });

        if(tarefaExistente.rowCount !== 1){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
            dbClient: db
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para editar tarefas neste espaço!'));
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
