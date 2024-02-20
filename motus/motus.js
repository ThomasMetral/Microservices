const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const score_uri = process.env.SCORE_URI || "http://localhost:4000";
const api_path = process.env.API_PATH || "/home/cytech/Microservices/motus/data/liste_francais_utf8.txt"
const os = require('os');
const path = require('path');

const bodyParser = require('body-parser');

const cors = require('cors');

const fs = require('fs');
// const api_path = "/home/cytech/Microservices/motus/data/liste_francais_utf8.txt";

const fetch = require('node-fetch');

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

app.use(express.static(path.join(__dirname, 'public')));

app.post('/check-word', (req, res) => {
    const word_list = create_list();
    const number = get_number(word_list);
    let word = get_word(word_list, number);
    console.log(word);
    const word_to_guess_split = word.split('');
    //console.log(word_to_guess_split);
    
    let guessedWord = req.body.guessedWord;
    //console.log(guessedWord);
    const guessedWord_split = guessedWord.split('');

    nb_try++;
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
                console.log(data)
                res.send(result)
            })
            .catch(error => console.error('Error:', error))
    } else {
        res.send(result);
    }
})

app.get('/port', (req, res) => {
    res.send(`MOTUS APP working on ${os.hostname} port ${port}`);
});

app.listen(port, () => {
    console.log(`MOTUS APP working on ${os.hostname} port ${port}`);
});