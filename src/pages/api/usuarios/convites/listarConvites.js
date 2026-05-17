import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json(defaultResponse('Método não permitido'));
    }

    try {
        
        const invitesResult = await db.query({
            text: `
                SELECT
                    ec.id,
                    CASE 
                        WHEN ec.data_expiracao < NOW() AND ec.status = 'PENDENTE' THEN 'EXPIRADO'
                        ELSE ec.status::TEXT
                    END AS status,
                    ec.enviar_email,
                    ec.data_cadastro,
                    ec.data_expiracao,
                    ec.data_aceite,
                    ec.data_recusa,
                    e.icon as espaco_icon,
                    e.nome as espaco_nome,
                    e.ativo as espaco_ativo,
                    e.descricao as espaco_descricao,
                    e.sigla as espaco_sigla
                FROM espaco_convite ec
                JOIN espaco e ON e.id = ec.id_espaco
                WHERE ec.id_usuario = $1
            `,
            values: [req.user.id],
        });

        const invites = invitesResult.rows;
        
        return res.status(200).json(defaultResponse('Convites listados com sucesso', invites));
    }
    catch (error) {
        console.error('Erro ao listar convites:', error);
        return res.status(500).json(defaultResponse('Erro ao listar convites'));
    }
};

export default authMiddleware(handler);