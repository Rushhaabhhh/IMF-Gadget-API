import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://default:<password>@<hostname>:<port>';

const redisClient = new Redis(redisUrl);

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export default redisClient;
