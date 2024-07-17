// Imports
require('dotenv').config()
const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const session = require('express-session');
const MongoStore = require("connect-mongo");
//const isSignedIn = require('./middleware/is-signed-in.js')

const passUserToView = require('./middleware/pass-user-to-view.js')

// Controllers / Routes
const authController = require("./controllers/auth.js");
const filmsController = require('./controllers/films');
const reviewsController = require('./controllers/reviews.js');


// Constants
const app = express();
const port = process.env.PORT || 3000
const path = require('path');

//Middleware
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true}))
//Middleware for using to submit forms with different methods other than POST and GET
app.use(methodOverride('_method'))
// Morgan for logging HTTP requests
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs')
app.use(
    session({
      secret: process.env.SESSION_SECRET,// the secret is used to encrypt and decript the data n the session
      resave: false,// we do not need to force a save of an unmodified session
      saveUninitialized: true,// enforce a save of a new session that has yet to be initialised
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(passUserToView)

// Landing page
app.get('/', async (req, res) => {
    
    res.render('index.ejs', {
        user: req.session.user,
    });
  });


  // Auth
  app.use("/auth", authController);
 // app.use(isSignedIn);
  app.use('/films/reviews', reviewsController);
  app.use('/films', filmsController);


// Connections
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database connection established')
        

    // 404
app.get('*', (req,res)=> {
    res.render('404.ejs')
}) 


        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}
connect()