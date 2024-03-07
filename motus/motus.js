const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const score_uri = process.env.SCORE_URI || "http://localhost:4000";
const api_path = process.env.API_PATH || "/home/cytech/Microservices/motus/data/liste_francais_utf8.txt";
const oauth_uri = process.env.OAUTH_URI || "http://localhost:7000";
const oauth_server = process.env.OAUTH_SERVER || "http://localhost:7000";
const redirect_uri = process.env.REDIRECT_URI || "http://localhost:3000/callback";
const loki_uri = process.env.LOKI || "http://127.0.0.1:3100";
const os = require('os');
const path = require('path');

const bodyParser = require('body-parser');

const cors = require('cors');

const fs = require('fs');

const fetch = require('node-fetch');

const session = require('express-session');

const jwt = require('jsonwebtoken');

require('dotenv').config();
const secret = process.env.SECRET;
const clientid = process.env.CLIENTID;

const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const client = require("prom-client");
const options = {
  transports: [
    new LokiTransport({
      host: loki_uri
    })
  ]
};
const logger = createLogger(options);
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
});

const loginCounter = new client.Counter({
    name: 'login_total',
    help: 'Total number of successful logins',
});

// PORT=3001 node motus.js
let nb_try = 0;

function create_list() {
    const file = fs.readFileSync(api_path);
    const word_list = file.toString().split('\n');
    return word_list;
}

function get_word(word_list, number) {
    return word_list[number];
}

function get_number(word_list) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return (day + month + year) % word_list.length;
}

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.set('trust proxy', 1);
app.use(session({
    secret: 's3cur3',
    name: 'sessionId',
    resave: true,
    saveUninitialized: true
}));

app.get('/word-info', (req, res) => {
    const word_list = create_list();
    const number = get_number(word_list);
    let word = get_word(word_list, number);

    const word_info = {
        size: word.length,
        firstLetter: word.charAt(0).toUpperCase(),
    };

    res.json(word_info);
});

app.post('/check-word', (req, res) => {
    httpRequestCounter.inc();
    const word_list = create_list();
    const number = get_number(word_list);
    let word = get_word(word_list, number);
    console.log(word);
    const word_to_guess_split = word.split('');
    //console.log(word_to_guess_split);
    
    let guessedWord = req.body.guessedWord;
    //console.log(guessedWord);
    const guessedWord_split = guessedWord.split('');

    if (guessedWord.length !== word.length) {
        res.status(400).send("<span style='color: red;'>Le mot saisi ne comporte pas le même nombre de lettres</span>");
    } else {
        nb_try++;
        //console.log(nb_try);
        let result = '';

        for (let i = 0; i < guessedWord_split.length; i++) {
            if (guessedWord_split[i] === word_to_guess_split[i]) {
                result += "<span style='background-color: green;'>" + guessedWord_split[i] + "</span>";
            }
            else if (word_to_guess_split.includes(guessedWord_split[i])) {
                result += "<span style='background-color: orange;'>" + guessedWord_split[i] + "</span>";
            }
            else {
                result += guessedWord_split[i];
            }
        }
        
        if (guessedWord.trim() === word.trim()) {
            fetch(score_uri + "/setscore", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nb_try }),
            })
                .then(response => response.text())
                .then(data => {
                    //console.log(data);
                    nb_try = 0
                    //console.log(nb_try);
                    res.send(result)
                })
                .catch(error => console.error('Error:', error))
        } else {
            res.send(result);
        }
    }

    
});

app.get('/callback', (req, res) => {
    httpRequestCounter.inc();
    loginCounter.inc();
    const { code } = req.query;
    console.log("hello");

    if (!code) {
        res.status(400).send('Code introuvable');
    }
    
    fetch(`${oauth_server}/token?code=${code}`)
        .then(async response => {
            //console.log(response);
            const data = await response.json();
            const idToken = data.id_token;
            const decodedToken = jwt.verify(idToken, 'shhhhh');
            console.log(decodedToken);
            req.session.user = decodedToken;
            res.redirect('/');
        })
        .catch(error => {
            console.log('Error: ', error.message);
            res.status(500).send('Internal server error');
        })
});

app.get('/metrics', async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
});

app.use((req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect(`${oauth_uri}/authorize?clientid=${clientid}&secret=${secret}&redirect_uri=${redirect_uri}`);
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/port', (req, res) => {
    res.send(`MOTUS APP working on ${os.hostname} port ${port}`);
});

app.listen(port, () => {
    logger.info({ message: `MOTUS APP working on ${os.hostname} port ${port}`, labels: { 'host':os.hostname, 'port':port } });
    console.log(`MOTUS APP working on ${os.hostname} port ${port}`);
});