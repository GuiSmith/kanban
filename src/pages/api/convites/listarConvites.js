import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import buildImgSrc from '@/pages/api/utils/buildImgSrc';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
  name: 'USUARIOS',
  escrita: false,
};

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json(defaultResponse('Método não permitido'));
  }

  try {
    const idEspaco = Number(req.query?.id_espaco);

    if (!Number.isInteger(idEspaco) || idEspaco <= 0) {
      return res.status(400).json(defaultResponse('ID inválido'));
    }

    const espaco = await dbPrisma.espaco.findUnique({ where: { id: idEspaco }, select: { id: true } });
    if (!espaco) {
      return res.status(404).json(defaultResponse('Espaço não encontrado!'));
    }

    const hasPermission = await usuarioTemPermissao({
      idUsuario: req.user.id,
      idEspaco,
      nomePermissao: requiredPermission.name,
      escrita: requiredPermission.escrita,
    });
    if (!hasPermission) {
      return res.status(403).json(defaultResponse('Você não tem permissão para visualizar convites deste espaço!'));
    }

    const convites = await dbPrisma.espaco_convite.findMany({
      where: { id_espaco: idEspaco },
      select: {
        id: true,
        status: true,
        enviar_email: true,
        data_cadastro: true,
        data_expiracao: true,
        data_aceite: true,
        data_recusa: true,
        usuario: { select: { nome: true, email: true, username: true, avatar_public_url: true } },
      },
      orderBy: { data_cadastro: 'asc' },
    });
    const now = new Date();
    // Preserve the SQL ordering: pending, unexpired invitations come first.
    const pendingRank = convite => convite.status === 'PENDENTE' && convite.data_expiracao >= now ? 0 : 1;
    convites.sort((a, b) => pendingRank(a) - pendingRank(b));

    const data = convites.map(({ usuario, ...convite }) => ({
      ...convite,
      status: convite.status === 'PENDENTE' && convite.data_expiracao < now ? 'EXPIRADO' : convite.status,
      nome: usuario.nome,
      email: usuario.email,
      username: usuario.username,
      src: usuario.avatar_public_url ? buildImgSrc(usuario.avatar_public_url) : null,
    }));

    return res.status(200).json(defaultResponse('Segue convites', data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(defaultResponse('Erro ao listar convites'));
  }
};

export default authMiddleware(handler);
