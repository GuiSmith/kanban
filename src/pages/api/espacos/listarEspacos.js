import db from '@/pages/api/config/connectDB';

import defaultResponse from '../config/defaultResponse';
import authMiddleware from '../config/middlewares/authMiddleware';

const handler = async (req, res) => {
    const client = await db.connect();
    try {

        const [ownedSpaces, sharedSpaces] = await Promise.all([
            client.query({
                text: "SELECT * FROM espaco WHERE id_usuario = $1 ORDER BY id ASC",
                values: [req.user.id],
            }),
            client.query({
                text: `
                    SELECT e.* FROM espaco e
                    JOIN espaco_usuario eu ON e.id = eu.id_espaco
                    JOIN espaco_usuario_permissoes eup ON eup.id_espaco = e.id AND eup.id_usuario = eu.id_usuario
                    JOIN espaco_permissoes ep ON ep.id = eup.id_permissao
                    WHERE eu.id_usuario = $1 AND e.id_usuario != $1
                        AND eu.ativo = true
                        AND ep.nome = 'ESPACO'
                    ORDER BY e.id ASC
                `,
                values: [req.user.id],
            }),
        ]);

        const spaces = [...ownedSpaces.rows, ...sharedSpaces.rows];

        return res.status(200).json(defaultResponse('Segue espaços', spaces));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse('Erro ao listar espaços'));
    } finally {
        await client.release();
    }
};

export default authMiddleware(handler);
