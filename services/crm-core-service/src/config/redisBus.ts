import { createClient, RedisClientType } from 'redis';

export class RedisBus {
    private pubClient: RedisClientType;
    private subClient: RedisClientType;

    constructor() {
        const redisUrl = process.env.REDIS_URL || 'redis://redis-broker:6379';
        this.pubClient = createClient({ url: redisUrl });
        this.subClient = createClient({ url: redisUrl });

        this.pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
        this.subClient.on('error', (err) => console.error('Redis Sub Client Error', err));
    }

    public async connect(): Promise<void> {
        await this.pubClient.connect();
        await this.subClient.connect();
        console.log('RedisBus connected to Redis Broker.');
    }

    public async publish(channel: string, message: any): Promise<void> {
        const payload = JSON.stringify(message);
        await this.pubClient.publish(channel, payload);
    }

    public async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
        await this.subClient.subscribe(channel, (message) => {
            try {
                const parsedMessage = JSON.parse(message);
                callback(parsedMessage);
            } catch (error) {
                console.error(`Failed to parse message from channel ${channel}:`, error);
                callback(message);
            }
        });
        console.log(`Subscribed to Redis channel: ${channel}`);
    }
}

export const redisBus = new RedisBus();
