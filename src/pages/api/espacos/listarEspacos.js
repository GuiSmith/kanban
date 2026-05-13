import db from '@/pages/api/config/connectDB';

import defaultResponse from '../config/defaultResponse';
import authMiddleware from '../config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        const user = req.user;
        const sql = "SELECT * FROM espaco WHERE id_usuario = $1 ORDER BY id ASC";
        const spaces = await db.query({ text: sql, values:[user.id]});

        return res.status(200).json(defaultResponse('Segue espaços', spaces.rows));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse('Erro ao listar espaços'));
    }
};

export default authMiddleware(handler);