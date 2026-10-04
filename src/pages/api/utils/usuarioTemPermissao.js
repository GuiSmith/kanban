import dbPrisma from '@/pages/api/config/connectDbPrisma';

const usuarioTemPermissao = async ({ idUsuario, idEspaco, nomePermissao, escrita, dbClient = null }) => {
    const queryClient = dbClient ?? dbPrisma;

    try {

        // Verificando se idUsuario, idEspaco, nomePermissao e escrita são válidos
        if(!Number.isInteger(Number(idUsuario)) || idUsuario <= 0){
            throw new Error('ID de usuário inválido');
        }
        const id_usuario = Number(idUsuario);

        if(!Number.isInteger(Number(idEspaco)) || idEspaco <= 0){
            throw new Error('ID de espaço inválido');
        }
        const id_espaco = Number(idEspaco);

        if(typeof nomePermissao !== 'string' || nomePermissao.trim() === ''){
            throw new Error('Nome da permissão inválido');
        }
        const nome_permissao = nomePermissao.trim();

        if(typeof escrita !== 'boolean'){
            throw new Error('Valor de escrita inválido. Informe true, false ou null');
        }

        if (queryClient.espaco_usuario_permissoes) {
          const permissao = await queryClient.espaco_usuario_permissoes.findFirst({
            where: {
              id_usuario,
              id_espaco,
              espaco_permissoes: { nome: nome_permissao },
              ...(escrita ? { escrita: true } : {}),
            },
            select: { id: true },
          });
          return Boolean(permissao);
        }

        // Keep compatibility with routes that still pass a pg transaction client.
        const result = await queryClient.query({
            text: `
                SELECT 1
                FROM espaco_usuario_permissoes eup
                JOIN espaco_permissoes ep ON ep.id = eup.id_permissao
                WHERE eup.id_usuario = $1
                    AND eup.id_espaco = $2
                    AND ep.nome = $3
                    AND (eup.escrita = true OR $4 = false)
            `,
            values: [id_usuario, id_espaco, nome_permissao, escrita],
        });
        
        return result.rowCount > 0;
    }
    catch (error) {
        console.error('Erro ao verificar permissão do usuário:', error);
        throw new Error('Erro ao verificar permissão do usuário');
    }
};

export default usuarioTemPermissao;
