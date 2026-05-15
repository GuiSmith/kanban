import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import buildImgSrc from '@/pages/api/utils/buildImgSrc';

const formatUsuario = (usuario, vinculo) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  username: usuario.username,
  vinculo,
  src: usuario.avatar_public_url ? buildImgSrc(usuario.avatar_public_url) : null,
});

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json(defaultResponse('Método não permitido'));
  }

  try {
    const { id_espaco } = req.query ?? {};
    const idEspaco = Number(id_espaco);

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
    const hasVinculo = vinculoResult.rowCount === 1;

    if (!isProprietario && !hasVinculo) {
      return res.status(404).json(defaultResponse('Espaço não encontrado!'));
    }

    const participantesPromise = db.query({
      text: `
        SELECT
          u.id,
          u.nome,
          u.email,
          u.username,
          u.avatar_public_url
        FROM espaco_usuario eu
        JOIN usuario u ON u.id = eu.id_usuario
        WHERE eu.id_espaco = $1 AND eu.ativo = true
        ORDER BY u.nome ASC
      `,
      values: [idEspaco],
    });

    const proprietarioPromise = isProprietario
      ? Promise.resolve(null)
      : db.query({
        text: `
          SELECT id, nome, email, username, avatar_public_url
          FROM usuario
          WHERE id = $1
        `,
        values: [espaco.id_usuario],
      });

    const [participantesResult, proprietarioResult] = await Promise.all([
      participantesPromise,
      proprietarioPromise,
    ]);

    const usuariosMap = new Map();

    if (isProprietario) {
      usuariosMap.set(req.user.id, formatUsuario(req.user, 'Proprietário'));
    } else if (proprietarioResult?.rowCount === 1) {
      const proprietario = proprietarioResult.rows[0];
      usuariosMap.set(proprietario.id, formatUsuario(proprietario, 'Proprietário'));
    }

    participantesResult.rows.forEach((usuario) => {
      if (!usuariosMap.has(usuario.id)) {
        usuariosMap.set(usuario.id, formatUsuario(usuario, 'Participante'));
      }
    });

    const usuarios = Array.from(usuariosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));

    return res.status(200).json(defaultResponse('Segue usuários', usuarios));
  } catch (error) {
    console.log(error);
    return res.status(500).json(defaultResponse('Erro ao listar usuários'));
  }
};

export default authMiddleware(handler);
