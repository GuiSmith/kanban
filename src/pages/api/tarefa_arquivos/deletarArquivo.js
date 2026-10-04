import dbPrisma from '@/pages/api/config/connectDbPrisma';
import axios from 'axios';

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
            return res.status(400).json(defaultResponse('Informe o arquivo!'));
        }

        const idArquivo = Number(id);
        if (!Number.isInteger(idArquivo) || idArquivo <= 0) {
            return res.status(400).json(defaultResponse('Arquivo inválido!'));
        }

        const tarefaArquivo = await dbPrisma.tarefa_arquivo.findUnique({
          where: { id: idArquivo },
          include: { tarefa: { select: { id_espaco: true } } },
        });

        if (!tarefaArquivo?.tarefa) {
            return res.status(404).json(defaultResponse('Arquivo não encontrado!'));
        }

        const arquivo = tarefaArquivo;

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: arquivo.tarefa.id_espaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita,
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para deletar arquivos desta tarefa!'));
        }

        if (arquivo.id_opera) {
            try {
                const urlParams = new URLSearchParams({ file_id: arquivo.id_opera });
                const deleteOperaUrl = `${process.env.OPERA_LINK}/files?${urlParams.toString()}`;
                await axios.delete(deleteOperaUrl, {
                    headers: {
                        authorization: process.env.OPERA_API_KEY,
                    },
                });
            } catch (error) {
                console.log('Erro ao deletar arquivo no opera:', error?.response?.data?.message || 'Erro genérico');
            }
        }

        const arquivoDeletado = await dbPrisma.tarefa_arquivo.delete({ where: { id: idArquivo } });

        return res.status(200).json(defaultResponse('Arquivo deletado com sucesso', arquivoDeletado));
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(400).json(defaultResponse('Erro ao deletar arquivo no banco de dados!'));
        }
        console.log(error);
        return res.status(500).json(defaultResponse('Erro interno ao deletar arquivos'));
    }
};

export default authMiddleware(handler);
