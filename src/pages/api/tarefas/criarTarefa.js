import dbPrisma from '@/pages/api/config/connectDbPrisma';
import databaseDateToPrisma from '@/pages/api/utils/databaseDateToPrisma';
import isDatabaseDate from '@/pages/api/utils/isDatabaseDate';
import defaultResponse from '@/pages/api/config/defaultResponse.js';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';
import userBelongsToSpace from '../utils/userBelongsToSpace';
import { isValidTaskPriority } from '@/utils/taskPriority';

const requiredPermission = {
    name: 'QUADRO',
    escrita: true,
};

const handler = async (req, res) => {
    try {
        const dadosForm = req.body ?? {};
        const dadosObrigatorios = ['titulo','descricao','id_espaco','id_coluna'];
        const dadosPermitidos = [...dadosObrigatorios, 'id_responsavel','data_prevista','data_limite','prioridade'];
        const dadosObrigatoriosPreenchidos = dadosObrigatorios.every(dado => dadosForm[dado]);
        const somenteDadosPermitidosPreenchidos = Object.keys(dadosForm).every(key => dadosPermitidos.includes(key));

        if(!dadosObrigatoriosPreenchidos){
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar', { obrigatorios: dadosObrigatorios} ));
        }

        if(!somenteDadosPermitidosPreenchidos){
            return res.status(400).json(defaultResponse('Preencha apenas os dados permitidos para continuar', { obrigatorios: dadosObrigatorios} ));
        }
        
        if(!isValidTaskPriority(dadosForm.prioridade)){
            return res.status(400).json(defaultResponse('Prioridade inválida'));
        }

        const idEspaco = Number(dadosForm.id_espaco);
        if(!Number.isInteger(idEspaco) || idEspaco <= 0){
            return res.status(400).json(defaultResponse('ID inválido'));
        }

        const space = await dbPrisma.espaco.findUnique({ where: { id: idEspaco }, select: { id: true } });
        if(!space){
            return res.status(404).json(defaultResponse('Espaço não encontrado!'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para criar tarefas neste espaço!'));
        }
        dadosForm.id_espaco = idEspaco;

        const idColuna = Number(dadosForm.id_coluna);
        if(!Number.isInteger(idColuna) || idColuna <= 0){
            return res.status(400).json(defaultResponse('ID inválido'));
        }
        const coluna = await dbPrisma.coluna.findFirst({ where: { id: idColuna, id_espaco: idEspaco }, select: { id: true } });
        if(!coluna){
            return res.status(404).json(defaultResponse('Coluna não encontrada!'));
        }
        dadosForm.id_coluna = idColuna;

        if(dadosForm?.id_responsavel){
            dadosForm.id_responsavel = Number(dadosForm.id_responsavel);
            const responsavel = await dbPrisma.usuario.findUnique({
              where: { id: dadosForm.id_responsavel },
            });

            if(!responsavel){
                return res.status(404).json(defaultResponse('Responsável não encontrado!'));
            }

            const responsavelPertenceAoEspaco = await userBelongsToSpace(dadosForm.id_espaco, dadosForm.id_responsavel);

            if(responsavelPertenceAoEspaco.belongs === false){
                return res.status(403).json(defaultResponse('Usuário não pertence a este espaço!'));
            }
        }

        if(dadosForm?.data_prevista && !isDatabaseDate(dadosForm.data_prevista)){
            return res.status(400).json(defaultResponse('Tipo de data inválida'));
        }

        if(dadosForm?.data_limite && !isDatabaseDate(dadosForm.data_limite)){
            return res.status(400).json(defaultResponse('Tipo de data inválida'));
        }

        const { _max } = await dbPrisma.tarefa.aggregate({
          where: { id_coluna: idColuna },
          _max: { ordem: true },
        });
        dadosForm.ordem = (_max.ordem ?? 0) + 1;

        const tarefa = await dbPrisma.tarefa.create({
          data: {
            ...dadosForm,
            id_responsavel: dadosForm.id_responsavel == null ? null : Number(dadosForm.id_responsavel),
            data_prevista: databaseDateToPrisma(dadosForm.data_prevista),
            data_limite: databaseDateToPrisma(dadosForm.data_limite),
          },
        });

        return res.status(201).json(defaultResponse('Tarefa criada com sucesso', tarefa));

    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
}

export default authMiddleware(handler);
