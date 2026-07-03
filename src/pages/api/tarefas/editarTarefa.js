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
            id_coluna: 'coluna',
        };
        const data = {};
        const { id, titulo, descricao, id_coluna } = dadosForm;

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

        const tarefaExistenteResult = await db.query({
            text: `
                SELECT t.id, t.id_coluna
                FROM tarefa t
                JOIN espaco e ON e.id = t.id_espaco
                WHERE t.id = $1 AND e.id = $2
            `,
            values: [data.id, idEspaco]
        });

        if(tarefaExistenteResult.rowCount !== 1){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const tarefaExistente = tarefaExistenteResult.rows[0];

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

        if(tarefaExistente.id_coluna != data.id_coluna){
            const colunaExistenteResult = await db.query({ text: `SELECT id, nome, ativo FROM coluna WHERE id = $1`, values: [data.id_coluna]});
            if(colunaExistenteResult.rowCount !== 1){
                return res.status(404).json(defaultResponse('Coluna nova inexistente'));
            }
            const colunaExistente = colunaExistenteResult.rows[0];
            if(colunaExistente.ativo === false){
                return res.status(409).json(defaultResponse(`A coluna '${colunaExistente.nome}' está inativa, use outra`));
            }
        }

        const sql = `
            UPDATE tarefa
            SET titulo = $1,
                descricao = $2,
                id_coluna = $3,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;

        const tarefa = await db.query({ text: sql, values: [titulo, descricao, id_coluna, id] });

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
