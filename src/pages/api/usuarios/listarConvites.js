import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json(defaultResponse('Método não permitido'));
  }

  try {
    const convites = await dbPrisma.espaco_convite.findMany({
      where: { id_usuario: req.user.id },
      select: {
        id: true,
        status: true,
        enviar_email: true,
        data_cadastro: true,
        data_expiracao: true,
        data_aceite: true,
        data_recusa: true,
        espaco: { select: { icon: true, nome: true, ativo: true, descricao: true, sigla: true } },
      },
    });
    const now = new Date();
    const data = convites.map(({ espaco, ...convite }) => ({
      ...convite,
      status: convite.status === 'PENDENTE' && convite.data_expiracao < now ? 'EXPIRADO' : convite.status,
      espaco_icon: espaco.icon,
      espaco_nome: espaco.nome,
      espaco_ativo: espaco.ativo,
      espaco_descricao: espaco.descricao,
      espaco_sigla: espaco.sigla,
    }));

    return res.status(200).json(defaultResponse('Convites listados com sucesso', data));
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    return res.status(500).json(defaultResponse('Erro ao listar convites'));
  }
};

export default authMiddleware(handler);
