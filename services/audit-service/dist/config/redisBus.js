"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisBus = exports.RedisBus = void 0;
const redis_1 = require("redis");
class RedisBus {
    pubClient;
    subClient;
    constructor() {
        const redisUrl = process.env.REDIS_URL || 'redis://redis-broker:6379';
        this.pubClient = (0, redis_1.createClient)({ url: redisUrl });
        this.subClient = (0, redis_1.createClient)({ url: redisUrl });
        this.pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
        this.subClient.on('error', (err) => console.error('Redis Sub Client Error', err));
    }
    async connect() {
        await this.pubClient.connect();
        await this.subClient.connect();
        console.log('RedisBus connected to Redis Broker.');
    }
    async publish(channel, message) {
        const payload = JSON.stringify(message);
        await this.pubClient.publish(channel, payload);
    }
    async subscribe(channel, callback) {
        await this.subClient.subscribe(channel, (message) => {
            try {
                const parsedMessage = JSON.parse(message);
                callback(parsedMessage);
            }
            catch (error) {
                console.error(`Failed to parse message from channel ${channel}:`, error);
                callback(message);
            }
        });
        console.log(`Subscribed to Redis channel: ${channel}`);
    }
}
exports.RedisBus = RedisBus;
exports.redisBus = new RedisBus();
