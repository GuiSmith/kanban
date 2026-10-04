import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse.js';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: false,
};

const handler = async (req, res) => {
    try {
        const { id_espaco } = req.query;
        const idEspaco = Number(id_espaco);
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
            return res.status(403).json(defaultResponse('Você não tem permissão para listar colunas neste espaço!'));
        }

        const colunas = await dbPrisma.coluna.findMany({ where: { id_espaco: idEspaco }, orderBy: { ordem: 'asc' } });
        return res.status(200).json(defaultResponse('Colunas listadas com sucesso', colunas));

    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);