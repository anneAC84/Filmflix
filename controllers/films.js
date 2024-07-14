// controllers/listings.js
const express = require('express');
const router = express.Router();

//Model
const Films = require('../models/films');

//routes/controllers
router.get('/', async (req, res) => {
try {
    const films = await Films.find()
    res.render('films/index.ejs', {
        films
    })
} catch (error) {
    console.log(error)
    res.redirect('/')
}
})




module.exports = router;
