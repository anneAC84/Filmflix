// Imports
const serverless = require('serverless-http')
require('dotenv').config()

const express = require('express');


const morgan = require('../../morgan')
const mongoose = require('../../mongoose')
const methodOverride = require('../../method-override')
const session = require('../../express-session');
const MongoStore = require("../../connect-mongo");


const passUserToView = require('../.././middleware/pass-user-to-view.js')

// Controllers / Routes
const authController = require("../.././controllers/auth.js");
const filmsController = require('../.././controllers/films');



// Constants
const app = express();
const port = process.env.PORT || 3000
const path = require('path');

//Middleware

app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(express.static("public"));
app.set('view engine', 'ejs')
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(passUserToView)

app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    req.session.message = null;
  }
  next();
});

// Landing page
app.get('/', async (req, res) => {
    
    res.render('index.ejs', {
        user: req.session.user,
    });
  });


  // Auth
  app.use("/auth", authController);


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



module.exports.handler = serverless(app)
    } catch (error) {
        console.log(error)
    }
}
