// Imports
require('dotenv').config()
const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const session = require('express-session');
const MongoStore = require("connect-mongo");



// Controllers / Routes
const authController = require("./controllers/auth.js");



// Constants
const app = express();
const port = process.env.PORT || 3000

//Middleware
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true}))
//Middleware for using to submit forms with different methods other than POST and GET
app.use(methodOverride('_method'))
// Morgan for logging HTTP requests
app.use(morgan('dev'))
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
)


// Routes


// Landing page
app.get('/', async (req, res) => {
    
    res.render('index', {
        user: req.session.user,
    });
  });


  // Auth
  app.use("/auth", authController);



// Connections
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database connection established')
        
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}
connect()