import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import buildImgSrc from '@/pages/api/utils/buildImgSrc';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json(defaultResponse('Método não permitido'));
  }

  try {
    const termo = String(req.query?.termo ?? '').trim();
    const idEspaco = Number(req.query?.id_espaco);

    if (termo.length < 2) {
      return res.status(200).json(defaultResponse('Segue usuários', []));
    }

    if (!Number.isInteger(idEspaco) || idEspaco <= 0) {
      return res.status(400).json(defaultResponse('ID inválido'));
    }

    const [espacoResult, vinculoResult] = await Promise.all([
      db.query({
        text: `
          SELECT id, id_usuario
          FROM espaco
          WHERE id = $1
        `,
        values: [idEspaco],
      }),
      db.query({
        text: `
          SELECT id
          FROM espaco_usuario
          WHERE id_espaco = $1
            AND id_usuario = $2
            AND ativo = true
          LIMIT 1
        `,
        values: [idEspaco, req.user.id],
      }),
    ]);

    if (espacoResult.rowCount !== 1) {
      return res.status(404).json(defaultResponse('Espaço não encontrado!'));
    }

    const espaco = espacoResult.rows[0];
    const isProprietario = Number(espaco.id_usuario) === Number(req.user.id);

    if (!isProprietario && vinculoResult.rowCount !== 1) {
      return res.status(404).json(defaultResponse('Espaço não encontrado!'));
    }

    const usuariosPromise = db.query({
      text: `
        SELECT id, nome, email, username, avatar_public_url
        FROM usuario u
        WHERE u.ativo = true
          AND u.id <> $2
          AND CONCAT_WS(' ', u.nome, u.username, u.email) ILIKE $1
        ORDER BY u.nome ASC
        LIMIT 25
      `,
      values: [`%${termo}%`, req.user.id],
    });

    const participantesPromise = db.query({
      text: `
        SELECT id_usuario
        FROM espaco_usuario
        WHERE id_espaco = $1
          AND ativo = true
      `,
      values: [idEspaco],
    });

    const convitesPendentesPromise = db.query({
      text: `
        SELECT id_usuario
        FROM espaco_convite
        WHERE id_espaco = $1
          AND status = 'PENDENTE'
      `,
      values: [idEspaco],
    });

    const [usuariosResult, participantesResult, convitesPendentesResult] = await Promise.all([
      usuariosPromise,
      participantesPromise,
      convitesPendentesPromise,
    ]);

    const idsBloqueados = new Set([
      Number(espaco.id_usuario),
      ...participantesResult.rows.map((participante) => Number(participante.id_usuario)),
      ...convitesPendentesResult.rows.map((convite) => Number(convite.id_usuario)),
    ]);

    const usuarios = usuariosResult.rows
      .filter((usuario) => !idsBloqueados.has(Number(usuario.id)))
      .map(({ avatar_public_url, ...usuario }) => ({
        ...usuario,
        src: avatar_public_url ? buildImgSrc(avatar_public_url) : null,
      }));

    return res.status(200).json(defaultResponse('Segue usuários', usuarios));
  } catch (error) {
    console.log(error);
    return res.status(500).json(defaultResponse('Erro ao listar usuários'));
  }
};

export default authMiddleware(handler);
