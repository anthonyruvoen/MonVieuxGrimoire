const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { User } = require('../models/User');
const express = require('express');



// fonction pour s'inscrire
async function signUp(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    try {
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
        await User.create(user);
        res.send('Sign up');
    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong");
        return;
    }
    next();
}

// fonction pour se connecter
async function login(req, res, next) {
    const body = req.body;
    if (body.email == null || body.password == null) {
        res.status(400).send("email et mot de passe requis");
        return;
    }
    try {

        const userInDb = await User.findOne({
            email: body.email
        });
        if (userInDb == null) {
            res.status(401).send('Mauvaises informations de connexion');
            return;
        }
        const passwordInDb = userInDb.password;
        if (!isPasswordCorrect(req.body.password, passwordInDb)) {
            res.status(401).send('Mauvaises informations de connexion');
            return;
        }
        
        res.send({
            userId: userInDb._id,
            token: Token(userInDb._id)
        });
    } catch (e) {
        console.error(e);
        res.status(500).send ('erreur:' + e.message)
    }
}

function Token(id) {
    const payload = {
    userId: id
    };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
    return token;
}
// fonction pour crypter les mdp
function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

// fonction qui contrôle le mdp
function isPasswordCorrect(password, hash) {
    return bcrypt.compareSync(password, hash);
}


// Fonction pour supprimer tous les users de la BDD
// User.deleteMany({}).then(() =>  {
//     console.log("deleted all users");
// });

const usersRouter = express.Router();

// Envoyer des données sur le endpoint donné
usersRouter.post('/signup', signUp)
usersRouter.post('/login', login)

module.exports = { usersRouter };