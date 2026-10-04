import dbPrisma from '@/pages/api/config/connectDbPrisma';
// Next Auth Provider
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// Node
import jwt from 'jsonwebtoken';

// Personalizados
import defaultResponse from '../../config/defaultResponse';
import usernameGenerator from '@/pages/api/utils/usernameGenerator';
import insertIndividualSpace from '@/pages/api/utils/insertIndividualSpace';

const handler = async (req, res) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json(defaultResponse('Login com conta do google não autorizado'));
    }

    const data = {
        email: session.user.email,
        nome: session.user.name,
        provedor: 'google',
    };


    while (1) {
        const username = usernameGenerator();

        const existingUsername = await dbPrisma.usuario.findUnique({ where: { username }, select: { id: true } });

        if (!existingUsername) {
            data.username = username;
            break;
        }
    }

    const [emailExistente, usernameExistente] = await Promise.all([
        dbPrisma.usuario.findFirst({ where: { email: data.email } }),
        dbPrisma.usuario.findUnique({ where: { username: data.username }, select: { id: true } }),
    ]);

    if (usernameExistente) {
        return res.status(409).json(defaultResponse('Nome de usuário já existe, tente novamente'));
    }

    let user = emailExistente;

    if (!user) {
        user = await dbPrisma.usuario.create({ data });

        try {
            const espacoResult = await insertIndividualSpace(user);

            if (espacoResult.rowCount === 0) {
                console.log('Erro ao criar espaço pessoal para o usuário', user.id);
            }
        } catch (error) {
            console.error('Erro ao criar espaço pessoal:', error);
        }
    }

    const { senha: dbPassword, ...safeUser } = user;

    const token = jwt.sign(
        { ...safeUser },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return res.status(200).json(defaultResponse('Login realizado', token));
}

export default handler;