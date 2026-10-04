import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import buildImgSrc from '@/pages/api/utils/buildImgSrc';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: false,
};

const handler = async (req, res) => {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json(defaultResponse('Método não permitido'));
        }

        const idTarefaRaw = req.query?.id_tarefa;
        if (!idTarefaRaw) {
            return res.status(400).json(defaultResponse('Informe a tarefa!'));
        }

        const idTarefa = Number(idTarefaRaw);
        if (!Number.isInteger(idTarefa) || idTarefa <= 0) {
            return res.status(400).json(defaultResponse('Tarefa inválida!'));
        }

        const tarefa = await dbPrisma.tarefa.findUnique({
          where: { id: idTarefa },
          select: { id: true, id_espaco: true },
        });

        if (!tarefa) {
            return res.status(404).json(defaultResponse('Tarefa não encontrada!'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: tarefa.id_espaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para visualizar arquivos desta tarefa!'));
        }

        const arquivos = await dbPrisma.tarefa_arquivo.findMany({
          where: { id_tarefa: idTarefa },
          orderBy: { id: 'asc' },
        });

        if(!arquivos){
            return res.status(400).json(defaultResponse('Erro ao buscar tarefas no banco de dados'));
        }

        const data = arquivos.map(row => {
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
