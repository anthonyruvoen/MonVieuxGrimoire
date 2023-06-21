const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { User } = require('../models/User');
const express = require('express');
const usersRouter = express.Router();

// Envoyer des données sur le endpoint donné
usersRouter.post('/signup', signUp)
usersRouter.post('/login', login)

// fonction pour s'inscrire
async function signUp(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    if (email == null || password == null) {
        res.status(400).send('email et mot de passe requis');
        return;
    }
    try {
        const checkUserInDb = await User.findOne({
            email: email
            });
        if (checkUserInDb != null) {
            res.status(400).send('Email already exists');
            return;
        }
        const user = {
            email: email,
            password: hashPwd(password)
        };
        await User.create(user);
        res.send('Sign up');
    } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong");
        return;
    }
}

// fonction pour se connecter
async function login(req, res) {
    const body = req.body;
    if (body.email == null || body.password == null) {
        res.status(400).send("email et mot de passe requis");
        return;
    }
    try {

        const checkUserInDb = await User.findOne({
            email: body.email
        });
        if (checkUserInDb == null) {
            res.status(401).send('Mauvaises informations de connexion');
            return;
        }
        const passwordInDb = checkUserInDb.password;
        if (!isPasswordCorrect(req.body.password, passwordInDb)) {
            res.status(401).send('Mauvaises informations de connexion');
            return;
        }
        
        res.send({
            userId: checkUserInDb._id,
            token: Token(checkUserInDb._id)
        });
    } catch (e) {
        console.error(e);
        res.status(500).send ('erreur:' + e.message)
    }
}

// Génération du token
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
function hashPwd(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

// fonction qui vérifie le mdp
function isPasswordCorrect(password, hash) {
    return bcrypt.compareSync(password, hash);
}


// Fonction pour supprimer tous les users de la BDD
// User.deleteMany({}).then(() =>  {
//     console.log("deleted all users");
// });




module.exports = { usersRouter };