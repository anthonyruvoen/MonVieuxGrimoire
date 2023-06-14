const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const express = require('express');



// fonction pour s'inscrire
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

// fonction pour se connecter
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

// Poster ou obtenir des données sur le endpoint donné
usersRouter.post('/signup', signUp)
usersRouter.post('/login', login)

module.exports = { usersRouter };