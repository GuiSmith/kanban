import db from '@/pages/api/config/connectDB';
import dbPrisma from '@/pages/api/config/connectDbPrisma';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import usuarioTemPermissao from '@/pages/api/utils/usuarioTemPermissao';

const requiredPermission = {
    name: 'QUADRO',
    escrita: true,
};

const handler = async (req, res) => {
    try {
        const data = req.body ?? {};
        const dadosPermitidos = ['id','titulo','descricao','id_coluna','ordem'];
        const idInformado = 'id' in data;
        const apenasDadosPermitidosInformados = Object.keys(data).every(key => dadosPermitidos.includes(key));

        if(!idInformado){
            return res.status(400).json(defaultResponse('Informe o ID para continuar', { informados: data }));
        }

        if(!apenasDadosPermitidosInformados){
            return res.status(400).json(defaultResponse('Informe apenas dados permitidos', { informados: data, permitidos: dadosPermitidos }));
        }

        const tarefa = await dbPrisma.tarefa.findUnique({ where: { id: data.id }});

        if(!tarefa){
            return res.status(404).json(defaultResponse('Tarefa não encontrada'));
        }

        const hasPermission = await usuarioTemPermissao({
            idUsuario: req.user.id,
            idEspaco: tarefa.id_espaco,
            nomePermissao: requiredPermission.name,
            escrita: requiredPermission.escrita
        });
        if(!hasPermission){
            return res.status(403).json(defaultResponse('Você não tem permissão para editar tarefas neste espaço!'));
        }

        if(data?.id_coluna && tarefa.id_coluna != data.id_coluna){
            const coluna = await dbPrisma.coluna.findUnique({ where: { id: data.id_coluna }});

            if(!coluna){
                return res.status(404).json(defaultResponse('Coluna nova inexistente'));
            }

            if(coluna.ativo === false){
                console.log('coluna inativa cara: ', coluna);
                return res.status(409).json(defaultResponse(`A coluna '${coluna}' está inativa, use outra`));
            }
        }

        const { id: _, ...safeData } = data;

        console.log('data: ', data);
        console.log('Atualização: ', safeData);

        const tarefaAtualizada = await dbPrisma.tarefa.update({
            where: { id: data.id },
            data: safeData
        });

        return res.status(200).json(defaultResponse('Tarefa atualizada com sucesso', tarefaAtualizada));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse());
    }
};

export default authMiddleware(handler);
