import db from '@/pages/api/config/connectDB';

const getConviteByIdAndUsuario = async (idConvite, idUsuario, client = db) => {
  const conviteResult = await client.query({
    text: `
      SELECT
        ec.id,
        ec.id_espaco,
        ec.id_usuario,
        ec.status,
        ec.enviar_email,
        ec.data_cadastro,
        ec.data_expiracao,
        ec.data_aceite,
        ec.data_recusa,
        e.nome AS espaco_nome,
        e.descricao AS espaco_descricao,
        e.sigla AS espaco_sigla,
        e.icon AS espaco_icon,
        u.nome AS proprietario_nome,
        u.username AS proprietario_username
      FROM espaco_convite ec
      JOIN espaco e ON e.id = ec.id_espaco
      JOIN usuario u ON u.id = e.id_usuario
      WHERE ec.id = $1
        AND ec.id_usuario = $2
      LIMIT 1
    `,
    values: [idConvite, idUsuario],
  });

  if (conviteResult.rowCount !== 1) {
    return null;
  }

  const convite = conviteResult.rows[0];
  const expirado = convite.data_expiracao ? new Date(convite.data_expiracao) < new Date() : false;

  return {
    id: convite.id,
    id_espaco: convite.id_espaco,
    id_usuario: convite.id_usuario,
    status: convite.status,
    enviar_email: convite.enviar_email,
    data_cadastro: convite.data_cadastro,
    data_expiracao: convite.data_expiracao,
    data_aceite: convite.data_aceite,
    data_recusa: convite.data_recusa,
    expirado,
    espaco: {
      id: convite.id_espaco,
      nome: convite.espaco_nome,
      descricao: convite.espaco_descricao,
      sigla: convite.espaco_sigla,
      icon: convite.espaco_icon,
    },
    proprietario: {
      nome: convite.proprietario_nome,
      username: convite.proprietario_username,
    },
  };
};

export default getConviteByIdAndUsuario;
