const keys = require('./keys');

// express app setup
const express = require('express');
const bodyParser = require('body-parser');
// allow express to make requests to make cross-domain requests
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// connect to postgres
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG Connection'));
pgClient.query("CREATE TABLE IF NOT EXISTS values(number INT)")
  .catch(e => console.error(e));

// connect to redis
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
// note: we duplicate connections b/c once a pub/sub is established, that client
// can only be used for that means
const redisPublisher = redisClient.duplicate();

// express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

// return all values in this table
app.get('/values/all', async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  res.send(values.rows);
});

// return all indicies and values that have been calculated
app.get('/values/current', async (req,res) => {
  // redis lib does not support promises
  redisClient.hgetall('values', (err, values) => {
    if(err){
      console.error(err)
    }
    res.send(values);
  });
});

app.post('/values', async (req, res) => { 
  const index = req.body.index;
  // limit the fib #
  if(parseInt(index) > 40){
    return res.status(422).send("Index too high");
  }
  
  console.log("Insert value:", index);
  
  // write this key into redis (initialize)
  redisClient.hset('values', index, 'Nothing yet!');
  // publish to our worker (subscriber) to calculate the fib #
  redisPublisher.publish('insert', index);
  // insert the given index into postgres
  pgClient.query('INSERT INTO values (number) VALUES ($1)', [index]);
});

app.listen(5000, err => {
  console.log("Listening on port 5000");
});