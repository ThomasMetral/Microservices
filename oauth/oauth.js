const express = require('express');
const app = express();
const port = process.env.PORT || 7000;
const redis_url = process.env.REDIS || 'redis://localhost:6379';
const os = require('os');
const path = require('path');

const bodyParser = require('body-parser');

const cors = require('cors');

const redis = require('redis');

const jwt = require('jsonwebtoken');

app.use(express.static(path.join(__dirname, 'public')));

const client = redis.createClient({ url: redis_url })
client.on('error', err => console.log('Redis Client Error', err))
client.connect().then(() => {
    console.log("OK");
    const username = 'host';
    const pwd = '1234';
    client.hGet("login", username).then((data) => {
        data === null ? client.hSet("login", username, pwd) : console.log(data);
    });
    client.hGetAll("login").then((data) => {
        console.log(data);
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get('/authorize', (req, res) => {
    const { clientid, secret, redirect_uri } = req.query;
  
    if (clientid === 'gXUa6lPsEV9o568LVdwVdEu8OXagpxjA' && secret === '86df22ac950509a707889e789b12e3c9e579046729f9350e14f13c0f8292820c' && redirect_uri === 'http://localhost:3000/callback') {
    	res.redirect(`/login.html`);
    } else {
    	res.status(400).send('Invalid parameters');
    }
});
  
app.post('/check-login', (req, res) => {
	const login = req.body.login;
	const pwd = req.body.pwd;
	//console.log(login);

	client.hGet('login', login).then((data) => {
		if (data && data.trim() === pwd.trim()) {
			const code = Math.random().toString(36).substring(7);
			client.hSet("oauth", code, login);
			res.send(code);
			//res.redirect(`http://localhost:3000/callback?code=${code}`);
		} else {
			res.status(400).send("<span style='color: red;'>Identifiant ou mot de passe invalide</span>");
		}
	});
});

app.post('/register', (req, res) => {
	const login = req.body.login;
	const pwd1 = req.body.pwd1;
	const pwd2 = req.body.pwd2;

	client.hGet('login', login).then((data) => {
		if (data) {
			res.send("<span style='color: red;'>Identifiant déjà existant</span>");
		} else {
			if (pwd1.trim() !== pwd2.trim()) {
				res.send("<span style='color: red;'>Mot de passe incorrect</span>");
			} else {
				client.hSet("login", login, pwd1);
				res.send("<span style='color: green;'>Inscription réussie</span>");
			}
		}
	});
});

app.get('/token', (req, res) => {
	const { code } = req.query;

	client.hGet('oauth', code).then((data) => {
		if (data) {
			const idToken = jwt.sign(data, 'shhhhh');
			res.json({ id_token: idToken });
		} else {
			res.status(400).json({ error: 'Code invalide' });
		}
	});
});

app.listen(port, () => {
	console.log(`OAUTH APP running on port ${port}`);
});