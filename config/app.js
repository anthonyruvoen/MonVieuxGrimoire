const express = require('express');
const cors= require('cors');
const app = express();
require("./../db/mongo.js");


// Définition du port utilisé par l'environnement du serveur OU 4000
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/images", express.static("uploads"));

app.listen(PORT, function () {
    console.log(`Server is running on: ${PORT}`);
})

module.exports = { app };