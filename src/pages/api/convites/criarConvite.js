import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import RabbitmqServer from '@/pages/api/config/rabbitmq';
import getCurrentUrl from '@/pages/api/config/getCurrentUrl';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';
import rules from './inviteRules';

const requiredPermission = {
  name: 'USUARIOS',
  escrita: true,
};

const publishEmail = async value => {
  try {
    const queueName = 'espaco_convite';
    const queue = new RabbitmqServer();
    await queue.start();
    await queue.publish(queueName, value);
    await queue.disconnect();
    return true;
  } catch (error) {
    console.log('Erro ao publicar na fila: ', error);
    return false;
  }
};

const emailBody = data => `
  <h1>Convite para espaço </h1>
  <p>Você foi convidado para participar do espaço <strong>${data.nomeEspaco}</strong></p>
  <p>Acesse seu perfil na aba <strong>Convites</strong> para ver o convite:</p>
  <a href="${getCurrentUrl().fullUrl}/usuarios/perfil">Clique aqui</a> para acessar seu perfil</a>
`;

const handler = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json(defaultResponse('Método não permitido'));
    }

    const requiredData = ['id_espaco', 'id_usuario', 'enviar_email'];
    const data = req.body ?? {};
    const missingData = !requiredData.every(requiredKey => data[requiredKey] !== undefined);
    const idEspaco = Number(data.id_espaco);
    const idUsuario = Number(data.id_usuario);
    if (missingData) {
      return res.status(400).json(defaultResponse('Informe todos os dados obrigatórios'));
    }
    if (!Number.isInteger(idEspaco) || idEspaco <= 0 || !Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json(defaultResponse('ID inválido'));
    }
    if (typeof data.enviar_email !== 'boolean') {
      return res.status(400).json(defaultResponse('Enviar e-mail deve ser verdadeiro ou falso'));
    }

    const invite = await dbPrisma.$transaction(async tx => {
      const [space, user] = await Promise.all([
        tx.espaco.findUnique({ where: { id: idEspaco }, select: { id: true, nome: true, id_usuario: true } }),
        tx.usuario.findUnique({ where: { id: idUsuario }, select: { id: true, email: true, nome: true } }),
      ]);
      if (!space) {
        throw Object.assign(new Error('Espaço não encontrado!'), { status: 404 });
      }
      const hasPermission = await usuarioTemPermissao({
        idUsuario: req.user.id,
        idEspaco,
        nomePermissao: requiredPermission.name,
        escrita: requiredPermission.escrita,
        dbClient: tx,
      });
      if (!hasPermission) {
        throw Object.assign(new Error('Você não tem permissão para criar convites neste espaço!'), { status: 403 });
      }
      if (!user) {
        throw Object.assign(new Error('Usuário não encontrado!'), { status: 404 });
      }
      if (space.id_usuario === user.id) {
        throw Object.assign(new Error('Usuário já pertence ao espaço'), { status: 409 });
      }

      const userBond = await tx.espaco_usuario.findFirst({
        where: { id_espaco: idEspaco, id_usuario: idUsuario, ativo: true },
        select: { id: true },
      });
      if (userBond) {
        throw Object.assign(new Error('Usuário já pertence ao espaço'), { status: 409 });
      }
      if (data.enviar_email) {
        const sentEmails = await tx.espaco_convite.count({
          where: {
            id_usuario: idUsuario,
            enviar_email: true,
            data_cadastro: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });
        if (sentEmails >= rules.max_emails_in_24h) {
          throw Object.assign(new Error(`Limite de ${rules.max_emails_in_24h} e-mails em 24h atingido`), { status: 429 });
        }
      }
      const pendingInvite = await tx.espaco_convite.findFirst({
        where: { id_usuario: idUsuario, id_espaco: idEspaco, status: 'PENDENTE' },
        select: { id: true },
      });
      if (pendingInvite) {
        throw Object.assign(new Error('Usuário já foi convidado!'), { status: 409 });
      }

      const convite = await tx.espaco_convite.create({
        data: {
          id_espaco: idEspaco,
          id_usuario: idUsuario,
          enviar_email: data.enviar_email,
          data_expiracao: new Date(Date.now() + rules.expiration_days * 24 * 60 * 60 * 1000),
        },
      });
      if (data.enviar_email) {
        const published = await publishEmail(JSON.stringify({
          id_usuario: user.id,
          email: user.email,
          assunto: 'KANBAN: Convite de espaço',
          corpo: emailBody({ nomeEspaco: space.nome }),
          id_convite: convite.id,
        }));
        if (!published) {
          throw Object.assign(new Error('Erro ao enviar e-mail. Contate o suporte'), { status: 500 });
        }
      }
      return convite;
    }, { timeout: 30000 });

    return res.status(201).json(defaultResponse('Convite criado', invite));
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json(defaultResponse(error.message));
    }
    console.log('Erro ao criar convite: ', error);
    return res.status(500).json(defaultResponse('Erro ao criar convite. Contate o suporte!'));
  }
};

export default authMiddleware(handler);
