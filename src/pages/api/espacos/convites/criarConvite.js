import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';
import authMiddleware from '@/pages/api/config/middlewares/authMiddleware';
import RabbitmqServer from '@/pages/api/config/rabbitmq';
import buildInsert from '@/pages/api/utils/buildInsert';
import getCurrentUrl from '@/pages/api/config/getCurrentUrl';

const max_emails_in_24h = 5;
const max_pending_invites = 5;
const expiration_days = 3;

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
        const idEspaco = Number(data.id_espaco);
        const idUsuario = Number(data.id_usuario);

        if(missingData) {
            return res.status(400).json(defaultResponse('Informe todos os dados obrigatórios'));
        }
        
        if(!Number.isInteger(idEspaco) || idEspaco <= 0 || !Number.isInteger(idUsuario) || idUsuario <= 0){
            return res.status(400).json(defaultResponse('ID inválido'));
        }

        if(typeof data.enviar_email !== 'boolean'){
            return res.status(400).json(defaultResponse('Enviar e-mail deve ser verdadeiro ou falso'));
        }

        await client.query('BEGIN');

        const [spaceResult, requestUserBondResult, userResult] = await Promise.all([
            client.query({
                text: `SELECT id, nome, id_usuario FROM espaco WHERE id = $1`,
                values: [idEspaco]
            }),
            client.query({
                text: `
                    SELECT id
                    FROM espaco_usuario
                    WHERE id_espaco = $1
                    AND id_usuario = $2
                    AND ativo = true
                    LIMIT 1
                `,
                values: [idEspaco, req.user.id]
            }),
            client.query({
                text: `SELECT id, email, nome FROM usuario WHERE id = $1`,
                values: [idUsuario]
            })
        ]);

        if(spaceResult.rowCount !== 1){
            await client.query('ROLLBACK');
            return res.status(404).json(defaultResponse('Espaço não encontrado!'));
        }

        const space = spaceResult.rows[0];
        const isOwner = Number(space.id_usuario) === Number(req.user.id);
        const hasSpaceBond = requestUserBondResult.rowCount === 1;

        if(!isOwner && !hasSpaceBond){
            await client.query('ROLLBACK');
            return res.status(404).json(defaultResponse('Espaço não encontrado!'));
        }

        if(userResult.rowCount !== 1){
            await client.query('ROLLBACK');
            return res.status(404).json(defaultResponse('Usuário não encontrado!'));
        }

        const user = userResult.rows[0];

        if(Number(space.id_usuario) === Number(user.id)){
            await client.query('ROLLBACK');
            return res.status(409).json(defaultResponse('Usuário já pertence ao espaço'));
        }

        const userBondResult = await client.query({
            text: `
                SELECT id
                FROM espaco_usuario
                WHERE id_espaco = $1
                AND id_usuario = $2
                AND ativo = true
                LIMIT 1
            `,
            values: [idEspaco, idUsuario]
        });

        if(userBondResult.rowCount === 1){
            await client.query('ROLLBACK');
            return res.status(409).json(defaultResponse('Usuário já pertence ao espaço'));
        }

        if(data.enviar_email === true){
            const sentEmailsResult = await client.query({
                text: `
                    SELECT COUNT(*)::int AS total
                    FROM espaco_convite
                    WHERE id_usuario = $1
                    AND enviar_email = true
                    AND data_cadastro >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
                `,
                values: [idUsuario]
            });

            if(sentEmailsResult.rows[0].total >= max_emails_in_24h){
                await client.query('ROLLBACK');
                return res.status(429).json(defaultResponse('Limite de 5 e-mails em 24h atingido'));
            }
        }

        const pendingInvitesResult = await client.query({
            text: `
                SELECT COUNT(*)::int AS total
                FROM espaco_convite
                WHERE id_usuario = $1
                AND id_espaco = $2
                AND status = 'PENDENTE'
            `,
            values: [idUsuario, idEspaco]
        });

        if(pendingInvitesResult.rows[0].total >= max_pending_invites){
            await client.query('ROLLBACK');
            return res.status(409).json(defaultResponse('usuário já possui 5 convites pendentes'));
        }

        const inviteData = {
            id_espaco: idEspaco,
            id_usuario: idUsuario,
            enviar_email: data.enviar_email,
            data_expiracao: new Date(Date.now() + expiration_days * 24 * 60 * 60 * 1000),
        };

        const inviteSql = buildInsert('espaco_convite', inviteData);
        const inviteResult = await client.query({ text: inviteSql.text, values: inviteSql.values });
        
        if(inviteResult.rowCount !== 1){
            console.log('Convite não criado: ', inviteResult);
            await client.query('ROLLBACK');
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

            const published = await publishEmail(JSON.stringify(emailData));

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

export default authMiddleware(handler);
