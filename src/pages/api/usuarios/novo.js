import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse.js';
import getTableColumns from '@/pages/api/utils/getTableColumns.js';
import encryptPassword from '@/pages/api/utils/encryptPassword.js';
import isEmailValid from '@/pages/api/utils/isEmailValid.js';
import isUsernameValid from '@/pages/api/utils/isUsernameValid.js';
import insertIndividualSpace from '@/pages/api/utils/insertIndividualSpace.js';

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json(defaultResponse('Método não permitido'));
    }

    try {
        const dbColumns = await getTableColumns('usuario');
        const dadosForm = req.body ?? {};
        const data = {};

        data.email = dadosForm.email?.trim().toLowerCase();
        data.nome = dadosForm.nome?.trim();
        data.username = dadosForm.username?.trim();
        data.senha = dadosForm.senha?.trim();

        const dadosObrigatorios = {
            email: 'E-mail',
            nome: 'Nome',
            username: 'Nome de usuário',
            senha: 'Senha'
        };

        for(const dado in dadosObrigatorios){

            if(!data[dado]){
                return res.status(400).json(defaultResponse('Preencha todos os dados para continuar'));
            }

            const column = dbColumns.find(col => col.column_name == dado);

            const maxLength = column.character_maximum_length;
            if(data[dado].length > maxLength){
                return res.status(400).json(defaultResponse(`${dadosObrigatorios[dado]} deve ter no máximo ${maxLength} caracteres`));
            }
        }

        if (!isEmailValid(data.email)) {
            return res.status(400).json(defaultResponse('Informe um e-mail válido.'));
        }

        if(!isUsernameValid(data.username)){
            return res.status(400).json(defaultResponse('Usuário deve ter apenas letras e números'));
        }

        const [emailExistente, usernameExistente] = await Promise.all([
            dbPrisma.usuario.findFirst({ where: { email: data.email }, select: { id: true } }),
            dbPrisma.usuario.findUnique({ where: { username: data.username }, select: { id: true } }),
        ]);

        if (emailExistente) {
            return res.status(409).json(defaultResponse('E-mail já cadastrado.'));
        }

        if (usernameExistente) {
            return res.status(409).json(defaultResponse('Username já cadastrado.'));
        }

        data.senha = await encryptPassword(data.senha);

        const user = await dbPrisma.usuario.create({ data });

        try {

            const espacoResult = await insertIndividualSpace(user);

            if (espacoResult.rowCount !== 1){
                console.log('Espaço pessoal não foi criado!');
            }
        } catch (error) {
            console.log('Erro ao criar espaço pessoal padrão:', error);
        }

        return res.status(201).json(defaultResponse('Usuário criado com sucesso', user));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse('Erro ao criar usuário. Contate o suporte'));
    }
};

export default handler;
