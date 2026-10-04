import dbPrisma from '@/pages/api/config/connectDbPrisma';

const getConviteByIdAndUsuario = async (idConvite, idUsuario, client = dbPrisma) => {
  const convite = await client.espaco_convite.findFirst({
    where: { id: Number(idConvite), id_usuario: Number(idUsuario) },
    select: {
      id: true,
      id_espaco: true,
      id_usuario: true,
      status: true,
      enviar_email: true,
      data_cadastro: true,
      data_expiracao: true,
      data_aceite: true,
      data_recusa: true,
      espaco: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          sigla: true,
          icon: true,
          usuario: { select: { nome: true, username: true } },
        },
      },
    },
  });

  if (!convite) {
    return null;
  }

  const { espaco, ...data } = convite;
  const { usuario: proprietario, ...espacoData } = espaco;

  return {
    ...data,
    expirado: convite.data_expiracao ? convite.data_expiracao < new Date() : false,
    espaco: espacoData,
    proprietario,
  };
};

export default getConviteByIdAndUsuario;
