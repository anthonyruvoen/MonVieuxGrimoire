const { upload } = require('../middlewares/multer');
const { Book } = require('../models/Book');
const jsonwebtoken = require('jsonwebtoken');
const express = require('express');
const booksRouter = express.Router();

booksRouter.get('/bestrating', getBestRating);
booksRouter.get('/:id', getBookById);
booksRouter.get('/', getBooks);
booksRouter.post('/', checkToken, upload.single("image"), postBook);
booksRouter.delete('/:id', checkToken, deleteBook);
booksRouter.put('/:id', checkToken, upload.single("image"), updateBook);
booksRouter.post('/:id/rating', checkToken, evalBook);

//Vérifier si le token est bon
function checkToken(req, res, next) {
    const headers = req.headers;
    const authorization = headers.authorization;
    if (authorization == null) {
        res.status(401).send('Pas autorisé');
        return;
    }
    const token = authorization.split(' ')[1];
    try {
        const jwtSecret = String(process.env.JWT_SECRET);
        const tokenPayload = jsonwebtoken.verify(token, jwtSecret);
        if (tokenPayload == null) {
            res.status(401).send('pas autorisé');
            return;
        }
        req.tokenPayload = tokenPayload;
        next();
    } catch (e) {
        console.error(e);
        res.status(401).send('Pas autorisé');
    }
}

// fonction pour récupérer les livres 
async function getBooks(req, res) {
    try {
        const books = await Book.find();
        books.forEach((book) => {
            book.imageUrl = getImagePath(book.imageUrl);
        });
        res.send(books);
    } catch (e) {
        console.error(e);
        res.status(500).send('erreur:' + e.message);
    }
}

//Récupérer un livre par son id
async function getBookById(req, res) {
    const id = req.params.id;
    try {
        const book = await Book.findById(id);
        if (book == null) {
            res.status(404).send('Aucun livre trouvé');
            return;
        }
        book.imageUrl = getImagePath(book.imageUrl); 
        res.send(book);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur" + e.message)
    }
}

// fonction pour ajouter un livre
async function postBook(req, res) {

    // Récupérer les données du livres en string
        const stringifiedBook = req.body.book;
    
    //lire la string pour le transformer en objet
        const book = JSON.parse(stringifiedBook);
    
        const filename = req.file.filename;
        book.imageUrl = filename;
        try {
            const result = await Book.create(book);
            res.send({message: "book posted", book: result});
        } catch (e) {
            res.status(500).send("Something went wrong" + e.message);
        }
    }

// Modifier un livre 
async function updateBook(req, res) {
    try {
    const id = req.params.id;
    //JSON.parse pour transformer une donnée stringifiée
    const bookSearch = await Book.findById(id);
        if (bookSearch == null) {
            res.status(404).send('Aucun livre trouvé');
            return;
        }
        const userSearch = bookSearch.userId;
        const userInToken = req.tokenPayload.userId;
        if (userSearch != userInToken) {
            res.status(403).send('modification non autorisée')
            return;
        }
        const updatedBook = {};
        if (req.body.title) updatedBook.title = req.body.title;
        if (req.body.author) updatedBook.author = req.body.author;
        if (req.body.year) updatedBook.year = req.body.year;
        if (req.body.genre) updatedBook.genre = req.body.genre;
        if (req.file != null) updatedBook.imageUrl = req.file.filename;

        await Book.findByIdAndUpdate(id, updatedBook);
        res.send("livre modifié")
} catch (e) {
    console.error(e);
    res.status(500).send('Erreur:' + e.message);
}
}

// Supprimer un livre
async function deleteBook(req, res) {
    const id = req.params.id;
    try {
        const bookSearch = await Book.findById(id);
        if (bookSearch == null) {
            res.status(404).send('Aucun livre trouvé');
            return;
        }
        const userSearch = bookSearch.userId;
        const userInToken = req.tokenPayload.userId;
        if (userSearch != userInToken) {
            res.status(403).send('Suppression non autorisée')
            return;
        }
        await Book.findByIdAndDelete(id);
        res.send('Livre supprimé');
    } catch (e) {
        console.error(e);
        res.status(500).send ('Erreur:' + e.message)
    }
}

//Ajouter une note
async function evalBook (req, res) {
        const id = req.params.id;
        if (id == null || id == "undefined") {
            res.status(400).send('id introuvable');
            return;
        }
        const rating = req.body.rating;
        const userId = req.tokenPayload.userId;
        try {
            const book = await Book.findById(id);
            if (book == null) {
                res.status(404).send('Livre non trouvé');
                return;
            }
            const ratingsInDb = book.ratings;
            const findRatingFromId = ratingsInDb.find((rating) => rating.userId == userId);
            if (findRatingFromId != null) {
                res.status(400).send('Vous avez déjà noté ce livre');
                return;
            }
            
            const newRating = { userId: userId, grade: rating };
            ratingsInDb.push(newRating);
            book.averageRating = calcAverageRating(ratingsInDb);
            await book.save();
            res.status(200).json(book);
        } catch (e) {
            console.error(e);
            res.status(500).send('Erreur:' + e.message);
        }

        }

// Recalculer la note moyenne
function calcAverageRating(ratings) {
    const totalRatings = ratings.reduce((total, rating) => total + rating.grade, 0);
        let average = totalRatings / ratings.length;
        let averageMinified = Math.round(average * 100) / 100;
        return averageMinified;
    };

// Afficher les 3 meilleurs livres
async function getBestRating(req, res) {
    try {
        const bestBooks = await Book.find().sort({ rating: -1 }).limit(3);
        bestBooks.forEach((book) => {
            book.imageUrl = getImagePath(book.imageUrl);
        });
        res.send(bestBooks);
    } catch (e) {
        res.status(500).send("Erreur:" + e.message);
    };
};

// Récupérer l'url des images
function getImagePath(fileName) {
    return `${process.env.PUBLIC_URL}/${process.env.IMAGES_PUBLIC_URL}/`+fileName;
}




// Fonction pour supprimer tous les livres de la BDD
// Book.deleteMany({}).then(() => {
//     console.log("books deleted");
// });

module.exports = { booksRouter };