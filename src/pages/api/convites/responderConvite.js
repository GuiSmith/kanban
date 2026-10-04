import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import getConviteByIdAndUsuario from '@/pages/api/utils/getConviteByIdAndUsuario';

const handler = async (req, res) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json(defaultResponse('Método não permitido'));
    }

    const { id_convite, resposta } = req.body ?? {};
    const idConvite = Number(id_convite);
    if (!Number.isInteger(idConvite) || idConvite <= 0) {
      return res.status(400).json(defaultResponse('ID inválido'));
    }
    if (typeof resposta !== 'boolean') {
      return res.status(400).json(defaultResponse('Resposta deve ser um booleano'));
    }

    await dbPrisma.$transaction(async tx => {
      const convite = await getConviteByIdAndUsuario(idConvite, req.user.id, tx);
      if (!convite) {
        throw Object.assign(new Error('Convite não encontrado'), { status: 404 });
      }
      if (convite.status !== 'PENDENTE') {
        throw Object.assign(new Error('Apenas convites pendentes podem ser respondidos'), { status: 409 });
      }
      if (convite.expirado) {
        throw Object.assign(new Error('Convite expirado'), { status: 409 });
      }

      const vinculoExistente = await tx.espaco_usuario.findFirst({
        where: { id_espaco: convite.id_espaco, id_usuario: req.user.id, ativo: true },
        select: { id: true },
      });
      if (vinculoExistente) {
        throw Object.assign(new Error('Usuário já pertence ao espaço'), { status: 409 });
      }

      await tx.espaco_usuario.create({
        data: { id_espaco: convite.id_espaco, id_usuario: req.user.id },
      });
      const colunaData = resposta ? 'data_aceite' : 'data_recusa';
      await tx.espaco_convite.update({
        where: { id: idConvite },
        data: { status: resposta ? 'ACEITO' : 'RECUSADO', [colunaData]: new Date() },
      });
    });

    const conviteAtualizado = await getConviteByIdAndUsuario(idConvite, req.user.id);
    return res.status(200).json(defaultResponse(resposta ? 'Convite aceito' : 'Convite recusado', conviteAtualizado));
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json(defaultResponse(error.message));
    }
    console.log('Erro ao aceitar convite: ', error);
    return res.status(500).json(defaultResponse('Erro ao aceitar convite. Contate o suporte!'));
  }
};

export default authMiddleware(handler);
