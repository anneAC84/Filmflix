// Imports
require('dotenv').config()
const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')

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

// Routes
app.get('/', async (req, res) => {
    res.render('index');
  });
  
  app.use("/auth", authController);



// Server connections
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