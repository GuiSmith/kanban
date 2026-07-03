import db from '@/pages/api/config/connectDB';
import buildInsert from '@/pages/api/utils/buildInsert';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: true,
};

const tiposValidos = ['A FAZER', 'FAZENDO', 'FEITO'];

const handler = async (req, res) => {
    try {
        const dadosForm = req.body ?? {};
        const dadosObrigatorios = ['id','ativo','nome','tipo','ordem'];
        const dadosObrigatoriosPreenchidos = dadosObrigatorios.every(dado => dado in dadosForm);

        if(!dadosObrigatoriosPreenchidos){
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar', { body: dadosForm }));
        }

        const colunaResult = await db.query({ text: 'SELECT * FROM coluna WHERE id = $1', values:[dadosForm.id] });
        if(colunaResult.rowCount !== 1){
            return res.status(404).json(defaultResponse('Coluna não encontrada!'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: colunaResult.rows[0].id_espaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
            dbClient: db
        });
        if(!hasPermission){   
            return res.status(403).json(defaultResponse('Você não tem permissão para criar colunas neste espaço!'));
        }

        if(!tiposValidos.includes(dadosForm.tipo)){
            return res.status(400).json(defaultResponse('Tipo de coluna inválido'));
        }

        if(dadosForm.ativo === false){
            const tarefas = await db.query({
                text: `SELECT id FROM tarefa WHERE id_coluna = $1 `,
                values: [dadosForm.id]
            });

            if(tarefas.rowCount !== 0){
                return res.status(409).json(defaultResponse('Mova as tarefas desta coluna antes de desativá-la'));
            }
        }

        const updateResult = await db.query({
            text: `
                UPDATE coluna
                SET nome = $1, tipo = $2, ordem = $3, ativo = $4
                WHERE id = $5
                RETURNING *
            `,
            values: [dadosForm.nome, dadosForm.tipo, dadosForm.ordem, dadosForm.ativo, dadosForm.id],
        });

        return res.status(200).json(defaultResponse('Coluna atualizada com sucesso', updateResult.rows[0]));

    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);