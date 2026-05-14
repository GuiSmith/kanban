import { connect } from 'amqplib';

class RabbitmqServer {
    constructor() {
        this.url = process.env.RABBITMQ_URL;
    }

    start = async () => {
        this.conn = await connect(this.url);
        this.channel = await this.conn.createChannel();
    }

    disconnect = async () => {
        await this.channel.close();
        await this.conn.close();
    }

    publish = async (queue, message) => {

        await this.channel.assertQueue(queue, { durable: true });

        return this.channel.sendToQueue(queue,Buffer.from(message));
    }

    consume = (queue, callback) => {
        return this.channel.consume(queue, message => {
            callback()
        });
    }

    getQueueInformation = (queue) => {
        return this.channel.checkQueue(queue);
    }
};

export default RabbitmqServer;