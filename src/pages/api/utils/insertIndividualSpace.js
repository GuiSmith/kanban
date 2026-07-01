import db from '@/pages/api/config/connectDB';
import buildInsert from '@/pages/api/utils/buildInsert';

const insertIndividualSpace = async (user) => {
    const spaceData = {
        id_usuario: user.id,
        nome: 'Espaço pessoal',
        descricao: 'Espaço pessoal padrão. Criado ao criar conta',
        sigla: 'EP',
        icon: 'Folder',
    };

    const insertData = buildInsert('espaco', spaceData);

    const result = await db.query({ text: insertData.text, values: insertData.values });

    return result;
};

export default insertIndividualSpace;