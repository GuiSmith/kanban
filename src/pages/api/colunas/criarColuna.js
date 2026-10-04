import dbPrisma from '@/pages/api/config/connectDbPrisma';
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
        const dadosObrigatorios = ['nome','tipo','id_espaco'];
        const dadosObrigatoriosPreenchidos = dadosObrigatorios.every(dado => dadosForm[dado]);

        if(!dadosObrigatoriosPreenchidos){
            return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
        }

        if (dadosForm.descricao != null && typeof dadosForm.descricao !== 'string') {
          return res.status(400).json(defaultResponse('Descrição deve ser um texto'));
        }
        dadosForm.descricao = dadosForm.descricao?.trim() || null;

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
            return res.status(403).json(defaultResponse('Você não tem permissão para criar colunas neste espaço!'));
        }
        dadosForm.id_espaco = idEspaco;

        if(!tiposValidos.includes(dadosForm.tipo)){
            return res.status(400).json(defaultResponse('Tipo de coluna inválido'));
        }

        const { _max } = await dbPrisma.coluna.aggregate({
          where: { id_espaco: idEspaco },
          _max: { ordem: true },
        });
        dadosForm.ordem = (_max.ordem ?? 0) + 1;

        const coluna = await dbPrisma.coluna.create({ data: dadosForm });

        return res.status(201).json(defaultResponse('Coluna criada com sucesso', coluna));

    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
}

export default authMiddleware(handler);
