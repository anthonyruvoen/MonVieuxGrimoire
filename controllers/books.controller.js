const { Book } = require('../models/Book');
const { upload } = require('../middlewares/multer');
const express = require('express');


// fonction pour ajouter un livre
async function postBook(req, res) {
    const file = req.file;

// Récupérer les données du livres en string
    const stringifiedBook = req.body.book;

//lire la string pour le transformer en objet
    const book = JSON.parse(stringifiedBook);

    book.imageUrl = file.path;
    try {
        const result = await Book.create(book);
        res.send({message: "book posted", book: result});
    } catch (e) {
        res.status(500).send("Something went wrong" + e.message);
    }
}

// fonction pour récupérer les livres 
function getBooks(req, res) {
    res.send(books);
}

const booksRouter = express.Router();
booksRouter.get('/', getBooks);
booksRouter.post('/', upload.single("image"), postBook);

module.exports = { booksRouter };