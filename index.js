// Import de Express (doc express)
const express = require('express');
const app = express();
const cors= require('cors');

// Définition du port utilisé par l'environnement du serveur OU 4000
const PORT = (process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

function sayHi(req, res) {
    res.send('Hello World')
  }

// Récupérer des données à la racine (doc express)
app.get('/', sayHi)

// Poster des données sur le endpoint donné
app.post('/api/auth/signup', signUp)
app.post('/api/auth/login', login)


app.listen(PORT, function () {
    console.log(`Server is running on: ${PORT}`);
})

const users = [];

// Middleware pour s'inscrire
function signUp(req, res, next) {
    const body = req.body;
    console.log('body', body);
    const email = req.body.email;
    const password = req.body.password;

    
    const userInDb = users.find(user => user.email === email);
    console.log('userInDb', userInDb);
    if (userInDb != null) {
        res.status(400).send('Email already exists');
        return;
    }
    const user = {
        email: email,
        password: password
    };
    users.push(user);
    res.send('Sign up');
    next();
}

// Middleware pour se connecter
function login(req, res, next) {
    const body = req.body;
    console.log('body', body);
    console.log('users in db :', users);

    const userInDb = users.find(user => user.email === email);
    if (userInDb == null) {
        res.status(401).send('Wrong credentials');
        return;
    }
    const passwordInDb = userInDb.password;
    if (passwordInDb != body.password) {
        res.status(401).send('Wrong credentials');
    }

    if (body.email != 'anthonyruvoen@gmail.com') {
        res.status(401).send('Wrong credentials');
        return;
    }
    if (body.password != '123') {
        res.status(401).send('Wrong credentials');
        return;
    }
    res.send({
        userId: '123',
        token: 'token'
    });
}