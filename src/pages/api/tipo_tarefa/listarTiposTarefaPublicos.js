import db from '@/pages/api/config/connectDB';

import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';

const handler = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM tipo_tarefa WHERE id_espaco IS NULL');
        
        return res.status(200).json(defaultResponse('Segue tipos de tarefa públicos', rows));
    } catch (error) {
        console.error('Erro ao listar tipos de tarefa públicos', error);

        return res.status(500).json(defaultResponse('Erro ao listar tipos de tarefa públicos. Contate o suporte'));
    }
};

export default authMiddleware(handler);