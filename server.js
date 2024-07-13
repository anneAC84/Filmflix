// Imports
require('dotenv').config()
const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')


// Constants
const app = express();
const port = process.env.PORT || 3000

//Middleware
app.use(morgan('dev'))


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