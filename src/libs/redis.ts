import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT || '')
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export default redisClient;