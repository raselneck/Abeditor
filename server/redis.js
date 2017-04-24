const redis = require('connect-redis');
const url = require('url');

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 6379;

// Creates a new Redis store
const createStore = (session) => {
  // Get the Redis storage
  const RedisStore = redis(session);

  // Attempt to connect to Redis
  let config = {
    hostname: DEFAULT_HOST,
    port: DEFAULT_PORT,
  };

  // Get the password
  // NOTE - This is hard-coded for using Redis Cloud on Heroku
  let password;
  if (process.env.REDISCLOUD_URL) {
    const redisUrl = process.env.REDISCLOUD_URL;
    config = url.parse(redisUrl);
    password = config.auth.split(':')[1];
  }

  // Return the created store
  return new RedisStore({
    host: config.hostname,
    port: config.port,
    pass: password,
  });
};

// Export our functions
module.exports = {
  createStore,
};
