// Import de Express (doc express)
const express = require('express');
const app = express();
const { User } = require('./db/mongo');
const cors= require('cors');
const bcrypt = require('bcrypt');

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





// Middleware pour s'inscrire
async function signUp(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    
    const userInDb = await User.findOne({
        email: email
        });
    if (userInDb != null) {
        res.status(400).send('Email already exists');
        return;
    }
    const user = {
        email: email,
        password: hashPassword(password)
    };
    try {
        await User.create(user);
    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong");
        return;
    }
    res.send('Sign up');
    next();
}




// Middleware pour se connecter
async function login(req, res, next) {
    const body = req.body;
    
    const userInDb = await User.findOne({
        email: body.email
    });
    if (userInDb == null) {
        res.status(401).send('Wrong credentials');
        return;
    }
    const passwordInDb = userInDb.password;
    if (!isPasswordCorrect(req.body.password, passwordInDb)) {
        res.status(401).send('Wrong password');
        return;
    }

    res.send({
        userId: userInDb._id,
        token: 'token'
    });
}

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function isPasswordCorrect(password, hash) {
    return bcrypt.compareSync(password, hash);
}