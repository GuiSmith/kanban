import dbPrisma from '@/pages/api/config/connectDbPrisma';

import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: false,
};

const handler = async (req, res) => {
    try {
        const { id_espaco } = req.query ?? {};
        if(!id_espaco || isNaN(Number(id_espaco))){
            return res.status(400).json(defaultResponse('ID inválido'));
        }

        const space = await dbPrisma.espaco.findUnique({ where: { id: Number(id_espaco) }, select: { id: true } });
        if(!space){
            return res.status(404).json(defaultResponse('Espaço não encontrado!'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: Number(id_espaco),
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para visualizar as tarefas deste espaço!'));
        }

        const tarefas = await dbPrisma.tarefa.findMany({
          where: { id_espaco: space.id },
          orderBy: { id: 'asc' },
        });

        return res.status(200).json(defaultResponse('Segue tarefas', tarefas));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);
