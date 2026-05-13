import db from '@/pages/api/config/connectDB';

import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        const user = req.user;
        const sql = "SELECT * FROM tarefa WHERE id_usuario = $1 ORDER BY id ASC";
        const tarefas = await db.query({ text: sql, values:[user.id]});

        return res.status(200).json(defaultResponse('Segue tarefas', tarefas.rows));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);