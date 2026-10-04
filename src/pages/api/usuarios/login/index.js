import dbPrisma from '@/pages/api/config/connectDbPrisma';
import jwt from 'jsonwebtoken';

import defaultResponse from '@/pages/api/config/defaultResponse.js';
import verifyPassword from '@/pages/api/utils/verifyPassword.js';

const MENSAGEM_ERRO = 'Credenciais inválidas';

const handler = async (req, res) => {
    try {
        const { login = null, senha = null } = req.body ?? {};

        if(!login){
            return res.status(401).json(defaultResponse(MENSAGEM_ERRO));
        }

        if(!senha){
            return res.status(401).json(defaultResponse(MENSAGEM_ERRO));
        }

        const [userByUsername, userByEmail] = await Promise.all([
            dbPrisma.usuario.findMany({ where: { username: login } }),
            dbPrisma.usuario.findMany({ where: { email: login } }),
        ]);

        const usernameFound = userByUsername.length > 0;
        const emailFound = userByEmail.length > 0;

        if(usernameFound === emailFound){
            return res.status(401).json(defaultResponse(MENSAGEM_ERRO));
        }

        const user = usernameFound ? userByUsername[0] : userByEmail[0];

        const { senha: dbPassword, ...safeUser } = user;

        if(!dbPassword){
            return res.status(401).json(defaultResponse(MENSAGEM_ERRO));
        }

        const senhaCorreta = await verifyPassword(senha,dbPassword);

        if(!senhaCorreta){
            return res.status(401).json(defaultResponse(MENSAGEM_ERRO));
        }

        const token = jwt.sign(
            { ...safeUser },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json(defaultResponse('Login realizado', token));

    } catch (error) {
        console.log('Erro inesperado ao realizar login', error);

        return res.status(500).json(defaultResponse('Erro inesperado ao realizar login. Contate o suporte'));
    }
};

export default handler;
