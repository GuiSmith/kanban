import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: true,
};

const handler = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json(defaultResponse('Método não permitido'));
    }

    try {
        const { id } = req.query ?? {};

        if (!id) {
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
        }

        const tarefaExistente = await dbPrisma.tarefa.findUnique({ where: { id: Number(id) }, select: { id_espaco: true } });

        if(!tarefaExistente){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: tarefaExistente.id_espaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para deletar tarefas neste espaço!'));
        }

        const hasFiles = await dbPrisma.tarefa_arquivo.findFirst({ where: { id_tarefa: Number(id) }, select: { id: true } });

        if(hasFiles){
            return res.status(409).json(defaultResponse('Delete os arquivos antes de deletar as tarefas'));
        }

        const tarefa = await dbPrisma.tarefa.delete({ where: { id: Number(id) } });

        return res.status(200).json(defaultResponse('Tarefa deletada com sucesso', tarefa));
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json(defaultResponse('Tarefa não encontrada!'));
        }
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);
