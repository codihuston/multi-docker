const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  // reconnect every 1000ms
  retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

/**
 * Using recursive b/c it's slow, and will be useful in seeing
 * the redis client interact with the data (validates the purpose of having
 * the worker)
 * @param {*} index 
 */
function fib(index){
  if(index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// store incoming msg as an index => fib(iundex)
sub.on('message', (channel, message) => {
  console.log("Working on:", message);
  const result = fib(parseInt(message));
  console.log("Got result:", result);
  redisClient.hset('values', message, result);
});

sub.on('error', err => {
  console.error(err);
});

// subscribe to the insert event
sub.subscribe('insert');