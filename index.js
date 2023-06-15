const { app } = require('./config/app');
const { usersRouter } = require('./controllers/users');
const { booksRouter } = require('./controllers/books');
const PORT = process.env.PORT || 4000;


// Récupérer des données à la racine (doc express)
app.get('/', (req,res) => res.send('Server OK'));



//Tout ce qui passe par api/auth appelle le usersRouter
app.use('/api/auth', usersRouter);
//Tout ce qui passe par api/books appelle le booksRouter
app.use('/api/books', booksRouter);

app.listen(PORT, function () {
    console.log(`Server is running on: ${PORT}`);
})