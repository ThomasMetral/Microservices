const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const redis_url = process.env.REDIS || 'redis://localhost:6379';
const os = require('os');
const path = require('path');

const bodyParser = require('body-parser');

const redis = require('redis');

const cors = require('cors');

const session = require('express-session');

app.use(express.static(path.join(__dirname, 'public')));

const client = redis.createClient({ url: redis_url })
client.on('error', err => console.log('Redis Client Error', err))
client.connect().then(() => {
    console.log("ok")
    const username = 'host'
    const pwd = '1234'
    client.hGet("login", username).then((data) => {
        data === null ? client.hSet("login", username, pwd) : console.log(data);
    })
    client.hGetAll("login").then((data) => {
        console.log(data);
    })
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.set('trust proxy', 1);
app.use(session({
    secret: 's3cur3',
    name: 'sessionId',
    resave: true,
    saveUninitialized: true
}));

app.get('/session', (req, res) => {
    const sessionData = req.session;
    res.json(sessionData);
});

app.post('/check-login', (req, res) => {
    const login = req.body.login;
    const pwd = req.body.pwd;
    //console.log(login);

    client.hGet('login', login).then((data) => {
        if (data && data.trim() === pwd.trim()) {
            req.session.user = login;
            console.log(login);
            res.redirect('http://localhost:3000/');
        } else {
            res.send('Identifiant ou mot de passe invalide');
        }
    })
});

app.post('/register', (req, res) => {
    const login = req.body.login;
    const pwd1 = req.body.pwd1;
    const pwd2 = req.body.pwd2;

    client.hGet('login', login).then((data) => {
        if (data) {
            res.send('Identifiant déjà existant');
        } else {
            if (pwd1.trim() !== pwd2.trim()) {
                res.send('Mot de passe incorrect');
            } else {
                client.hSet("login", login, pwd1);
                res.send('Inscription réussie');
            }
        }
    });
});

app.use((req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login.html");
    }
});

app.get('/port', (req, res) => {
    res.send(`SESSION APP working on ${os.hostname} port ${port}`);
});

app.listen(port, () => {
  console.log(`SESSION APP working on ${os.hostname} port ${port}`);
});