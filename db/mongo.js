require("dotenv").config();
const mongoose = require("mongoose");

const DB_URL = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`;

async function connect() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connexion base de donnée OK");
    } catch (e) {
        console.error(e);
    }
}
connect();
