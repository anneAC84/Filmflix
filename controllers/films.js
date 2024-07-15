// controllers/listings.js
const express = require('express');
const router = express.Router();

//Model
const Films = require('../models/films');
const { route } = require('./auth');

//routes/controllers
router.get('/', async (req, res) => {
try {
    const films = await Films.find().populate('owner')
    console.log(films)
    res.render('films/index.ejs', {
        films
    })
} catch (error) {
    console.log(error)
    res.redirect('/')
}
})

router.get('/new', (req, res) => {
    try {
        res.render('films/new.ejs') 
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }

})

router.post('/', async (req, res) => {
    try {
        req.body.owner = req.session.user._id
        const createdFilm = await Films.create(req.body)
        res.redirect('/films') 
    } catch (error) {
        console.log(error)

        res.render('films/new.ejs', { errorMessage: error.message })
    }

})
// Show route
router.get('/:filmsId', async (req,res) => {
    try {
        const filmsId = req.params.filmsId
        const films = await Films.findById(filmsId).populate('owner')
        console.log(films)
        res.render('films/show.ejs', {
            films
        })
    } catch (error) {

        console.log(error)
        res.redirect('/')
    }
})
//Delete route
router.delete('/:filmsId', async (req, res) => {
    try {
        const filmsId = req.params.filmsId
        const filmsToDelete = await Films.findById(filmsId)
         if(filmsToDelete.owner.equals(req.session.user._id)) {
        //Delete Film
        await filmsToDelete.deleteOne()
        res.redirect('/films')
        } else { 
            //do not delete film
            res.send('You do not have permission to delete this Film.')
        }
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.get('/:filmsId/edit', async (req, res) => {
    try {
 const films = await Films.findById(req.params.filmsId)
 if (!films) throw new Error()
    res.render('films/edit.ejs', {films})
    console.log(films)
    } catch (error) {
        res.redirect('/films')
    }
})

//Update route
router.put('/:filmsId', async (req,res) => {
    try {
        const filmsToUpdate = await Films.findById(req.params.filmsId)
        if(!filmsToUpdate) throw new Error()
            console.log(filmsToUpdate)
    } catch (error) {
    console.log(error)


    }
})

module.exports = router;
