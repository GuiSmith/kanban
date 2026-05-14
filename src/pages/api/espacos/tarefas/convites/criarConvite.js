import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import RabbitmqServer from '@/pages/api/config/rabbitmq';
import buildInsert from '@/pages/api/utils/buildInsert';
import getCurrentUrl from '@/pages/api/config/getCurrentUrl';

const publishEmail = async (value) => {
    try {
        const queueName = 'espaco_convite';
        const queue = new RabbitmqServer();
        await queue.start();

        await queue.publish(queueName, value);

        await queue.disconnect();

        return true;
    } catch (error) {
        console.log('Erro ao publicar na fila: ', error);
        
        return false;
    }
};

const emailBody = (data) => {
    return `
        <h1>Convite para espaço </h1>
        <p>Você foi convidado para participar do espaço <strong>${data.nomeEspaco}</strong></p>
        <a href='${data.linkConvite}'>Ver convite</a>
    `;
}

const buildInviteLink = (id) => {
    return `${getCurrentUrl()}/espacos/convites?id=${id}`;
}

const handler = async (req, res) => {
    const client = await db.connect();
    try {

        if(req.method !== 'POST'){
            return res.status(405).json(defaultResponse('Método não permitido'));
        }

        const requiredData = ['id_espaco','id_usuario','enviar_email'];
        const data = req.body ?? {};
        const missingData = !requiredData.every(requiredKey => data[requiredKey] !== undefined );

        if(missingData) {
            return res.status(400).json(defaultResponse('Informe todos os dados obrigatórios'));
        }

        await client.query('BEGIN');

        const spaceResult = await client.query({
            text: `SELECT id, nome FROM espaco WHERE id = $1`,
            values: [data.id_espaco]
        });

        if(spaceResult.rowCount !== 1){
            return res.status(404).json(defaultResponse('Espaço não encontrado!'));
        }

        const space = spaceResult.rows[0];

        const userResult = await client.query({
            text: `SELECT id, email, nome FROM usuario WHERE id = $1`,
            values: [data.id_usuario]
        });

        if(userResult.rowCount !== 1){
            return res.status(404).json(defaultResponse('Usuário não encontrado!'));
        }

        const user = userResult.rows[0];

        const inviteSql = buildInsert('espaco_convite', data);
        const inviteResult = await client.query({ text: inviteSql.text, values: inviteSql.values });
        
        if(inviteResult.rowCount !== 1){
            console.log('Convite não criado: ', inviteResult);
            return res.status(500).json(defaultResponse('Convite não criado. Contate o suporte'));
        }

        const invite = inviteResult.rows[0];

        if(data.enviar_email === true){
            const linkConvite = buildInviteLink(invite.id);
            const body = emailBody({ nomeEspaco: space.nome, linkConvite });

            const emailData = {
                id_usuario: user.id,
                email: user.email,
                assunto: `KANBAN: Convite de espaço`,
                corpo: body,
                id_convite: invite.id,
            };

            const published = await publishEmail(emailData);

            if(!published){
                await client.query('ROLLBACK');
                return res.status(500).json(defaultResponse('Erro ao enviar e-mail. Contate o suporte'));
            }
        }

        await client.query('COMMIT');

        return res.status(201).json(defaultResponse('Convite criado', invite));
    } catch (error) {
        console.log('Erro ao criar convite: ', error);
        await client.query('ROLLBACK');
        return res.status(500).json(defaultResponse('Erro ao criar convite. Contate o suporte!'));
    } finally {
        client.release();
    }
};

// export default authMiddleware(handler);
export default handler;