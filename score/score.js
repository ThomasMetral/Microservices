const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const redis_url = process.env.REDIS || "redis://localhost:6379";
const os = require('os');

const bodyParser = require('body-parser');

const redis = require('redis');

const cors = require('cors');

const client = redis.createClient({ url: redis_url });
client.on('error', err => console.log('Redis Client Error', err));
client.connect().then(() => {
    console.log('OK');
    client.get('nb_words_found').then((data) => data === null ? client.set('nb_words_found', 0) : console.log(data));
    client.get('average_try').then((data) => data === null ? client.set('average_try', 0) : console.log(data));
    client.get('total_nb_try').then((data) => data === null ? client.set('total_nb_try', 0) : console.log(data));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.get('/getscore', (req, res) => {
    let resData = {};
  
    client.get('nb_words_found').then((data) => {
        resData.nb = data;
  
        client.get('average_try').then((data) => {
            resData.avg = data;
            res.json(resData);
        })
    })
});
  
app.post('/setscore', (req, res) => {
    const nb_try = req.body.nb_try;
    const int_nb_try = parseInt(nb_try);
    let resData = {};
    
    client.get('nb_words_found').then((data) => {
        int_data = parseFloat(data);
        resData.nb_words_found = int_data + 1;
  
        client.get('total_nb_try').then((data) => {
            int_data = parseFloat(data);
            resData.total_nb_try = int_data + int_nb_try;
            resData.average_try = parseFloat(resData.total_nb_try / resData.nb_words_found);
    
            client.set('nb_words_found', resData.nb_words_found);
            client.set('total_nb_try', resData.total_nb_try);
            client.set('average_try', resData.average_try);
            res.send('Score set succesfully');
        })
    })
  })
  
app.get('/port', (req, res) => {
      res.send(`SCORE APP working on ${os.hostname} port ${port}`);
})
  
  
app.listen(port, () => {
    console.log(`SCORE APP working on ${os.hostname} port ${port}`);
})