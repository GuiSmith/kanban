import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json(defaultResponse('Método não permitido'));
  }

  try {
    const tarefas = await dbPrisma.tarefa.findMany({
      where: {
        id_responsavel: req.user.id,
        espaco: { ativo: true },
        OR: [{ id_coluna: null }, { coluna: { ativo: true } }],
      },
      select: {
        id: true,
        titulo: true,
        data_cadastro: true,
        data_atualizacao: true,
        data_prevista: true,
        data_limite: true,
        prioridade: true,
        id_espaco: true,
        espaco: { select: { nome: true, sigla: true } },
        coluna: { select: { nome: true, tipo: true } },
      },
      orderBy: [
        { data_limite: { sort: 'asc', nulls: 'last' } },
        { data_atualizacao: 'desc' },
      ],
    });
    const data = tarefas.map(({ espaco, coluna, ...tarefa }) => ({
      ...tarefa,
      espaco_nome: espaco.nome,
      espaco_sigla: espaco.sigla,
      coluna_nome: coluna?.nome ?? null,
      coluna_tipo: coluna?.tipo ?? null,
    }));

    return res.status(200).json(defaultResponse('Tarefas da dashboard listadas com sucesso', data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(defaultResponse('Erro ao carregar dados da dashboard'));
  }
};

export default authMiddleware(handler);
