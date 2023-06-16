const express = require('express');
const cors= require('cors');
const app = express();
require("./../db/mongo.js");



app.use(cors());
app.use(express.json());
app.use(`/${process.env.IMAGES_FOLDER}`, express.static("uploads"));



module.exports = { app };