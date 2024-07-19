// controllers/listings.js
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in.js')
const passUserToView = require('../middleware/pass-user-to-view.js')


//Model
const Film = require('../models/film');
const {route} = require('./auth');
const {findOneAndUpdate} = require('../models/user.js');
const {isObjectIdOrHexString} = require('mongoose');

//routes/controllers
router.get('/', async (req, res) => {
try {
    const films = await Film.find().populate('owner')
    console.log(films)
    res.render('films/index.ejs', {
        films
    })
} catch (error) {
    console.log(error)
    res.redirect('/')
}
})

router.get('/new',isSignedIn, (req, res) => {
    try {
        res.render('films/new.ejs') 
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }

})

router.post('/', isSignedIn, async (req, res) => {
    try {
        req.body.owner = req.session.user._id
        const createdFilm = await Film.create(req.body)
        res.redirect('/films') 
    } catch (error) {
        console.log(error)

        res.render('films/new.ejs', { errorMessage: error.message })
    }

})
// Show route
router.get('/:filmId', isSignedIn, async (req,res) => {
    try {
        const filmId = req.params.filmId
        const film = await Film.findById(filmId).populate('owner')

       if(!film) {
        const error = new Error('Film not findOneAndUpdate.')
        error.status = 404
        throw error
    }

    const userHasFavorited = film.favoritedByUsers.some(objectId => {
         return objectId.equals(req.session.user._id)
    });

        res.render('films/show.ejs', {
            film,
            userHasFavorited
        })
    } catch (error) {

        console.log(error)

     if (error.status === 404) {
        return res.render ('404.ejs')
     }
        res.redirect('/')
    }
})
//Delete route
router.delete('/:filmId', isSignedIn, async (req, res) => {
    try {
        const filmId = req.params.filmId
        const filmToDelete = await Film.findById(filmId)
         if(filmToDelete.owner.equals(req.session.user._id)) {
        //Delete Film
        await filmToDelete.deleteOne()
        res.redirect('/films')
        } else { 
            //do not delete film
            res.send('You do not have permission to delete this Film.')
        }
    } catch (error) {
        console.log(error)
        res.render('/')
    }
})
//edit route
router.get('/:filmId/edit', isSignedIn, async (req, res) => {
    try {
 const film = await Film.findById(req.params.filmId)
 if (!film) throw new Error('Film not found')
    if (film.owner.equals(req.session.user._id)) {
    res.render('films/edit.ejs', {film})
    } else {
    res.render('error',{errorMessage: 'You do not have permission to edit this Film.'})
    } 
} catch (error) {
        console.log(error)
        res.redirect('/films')
    }
})

//Update route
router.put('/:filmId', isSignedIn, async (req,res) => {
    try {
        const filmToUpdate = await Film.findById(req.params.filmId)
        if(!filmToUpdate) throw new Error('No Film to update')
            //check ownership
        if (filmToUpdate.owner.equals(req.session.user._id)) {
            //update the film with req.body
            await filmToUpdate.updateOne(req.body)
            res.redirect(`/films/${req.params.filmId}`)
        } else {
            // return an error message
            res.render('error',{errorMessage: 'You do not have permission to update this Film.'})
        }
    } catch (error) {
    console.log(error)
   }
})

//favorite route
router.post('/:filmId/favorited-by/:userId', isSignedIn, async (req, res) => {
    try {
        const filmId = req.params.filmId
        const updatedFilm = await Film.findByIdAndUpdate(filmId, {
            $push: { favoritedByUsers: req.session.user._id }
        })
      
      res.redirect(`/films/${filmId}`);
    } catch (error) {
      console.log(error);
      res.redirect('/films');
    }
  });

  // unfavorite delete route
router.delete('/:filmId/favorited-by/:userId', async (req, res) => {
    try {
        const filmId = req.params.filmId
        const film = await Film.findByIdAndUpdate(filmId, {
            $pull: { favoritedByUsers: req.session.user._id }
        })
        req.session.message = "Film was successfully deleted."
        res.redirect(`/films/${filmId}`);
      } catch (error) {
        req.session.message = err.message
        console.log(error);
        res.redirect('/');
      }
    });

    

     

module.exports = router;
