// controllers/films.js
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in.js')
const isAdmin = require('../middleware/is-admin.js');  // Import isAdmin middleware
const passUserToView = require('../middleware/pass-user-to-view.js')
const axios = require('axios');


//Model
const Film = require('../models/film');
const {route} = require('./auth');
const {findOneAndUpdate} = require('../models/user.js');
const {isObjectIdOrHexString} = require('mongoose');

const fetchMovies = async () => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`
        );

        if (!response.data || !response.data.results) {
            throw new Error('No movies found in the API response');
        }

        console.log("Movies fetched successfully! Inserting into database...");

        for (const movie of response.data.results) {
            await Film.updateOne(
                { title: movie.title }, // Find existing movie by title
                {
                    title: movie.title,
                    yearReleased: new Date(movie.release_date).getFullYear(),
                    description: movie.overview,
                    imageURL: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    mainActors: [],
                    owner: process.env.DEFAULT_OWNER_ID || '65a1f2dabc1234567890abcd',
                },
                { upsert: true } // Insert if it doesn’t exist, otherwise update
            );
        }

        console.log("Movies successfully added/updated in the database!");
    } catch (error) {
        console.error("Error fetching movies:", error.message);
        throw new Error("Failed to fetch movies from the API.");
    }
};

//routes/controllers
router.get('/', async (req, res) => {
    let films, newReleases, topRated, featuredMovies;
    let title = "Browse All Films"; // Default title

    if (req.session.user) {
        try {
            await fetchMovies();
        } catch (error) {
            console.error("Error fetching movies:", error.message);
        }
    }


    try {
        // Fetch all movies
        films = await Film.find().populate('owner');

        // Fetch featured movies (e.g., latest 5)
        featuredMovies = await Film.find().sort({ createdAt: -1 }).limit(5);

        // Fetch new releases (movies from the last year)
        newReleases = await Film.find({
            yearReleased: { $gte: new Date().getFullYear() - 1 }
        }).sort({ yearReleased: -1 }).limit(5);

        // Fetch top-rated movies (sorted by favorited users)
        topRated = await Film.find().sort({ favoritedByUsers: -1 }).limit(5);

        res.render('films/index.ejs', {
            films,
            newReleases,
            topRated,
            featuredMovies,
            title,
            isLoggedIn: req.session.user ? true : false,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});
// New route - Requires user to be signed in
router.get('/new',isSignedIn, (req, res) => {
    try {
        res.render('films/new.ejs') 
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }

})

router.post('/', isSignedIn,isAdmin, async (req, res) => {
    try {
        req.body.owner = req.session.user._id
        const createdFilm = await Film.create(req.body)
        res.redirect('/films') 
    } catch (error) {
        console.log(error)

        res.render('films/new.ejs', { errorMessage: error.message })
    }

})

// Route to fetch movies and add them to the database
router.get('/fetch-movies', async (req, res) => {
    try {
      await fetchMovies();
      res.send("Movies are being fetched and added to the database.");
    } catch (error) {
      console.error("Error in fetching movies:", error);
      res.status(500).send("Failed to fetch movies.");
    }
  });
     
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

    const userHasFavorited = film.favoritedByUsers?.some(objectId => objectId.equals(req.session.user._id)) || false;

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
// Delete route (admins can delete any film)
router.delete('/:filmId', isSignedIn, isAdmin, async (req, res) => {
    try {
        const filmId = req.params.filmId;
        const filmToDelete = await Film.findById(filmId);

        if (!filmToDelete) {
            return res.status(404).render('error', { errorMessage: 'Film not found.' });
        }

        // Admins can delete any film, others can only delete their own films
        if (filmToDelete.owner.equals(req.session.user._id) || req.session.user.isAdmin) {
            await filmToDelete.deleteOne();
            res.redirect('/films');
        } else {
            res.send('You do not have permission to delete this film.');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

//edit route
router.get('/:filmId/edit', isSignedIn, isAdmin, async (req, res) => {
    try {
 const film = await Film.findById(req.params.filmId)
 if (!film) {
    return res.status(404).render('error', { errorMessage: 'Film not found' });
  }
    // Admins can edit any film, others can only edit their own films
    if (film.owner.equals(req.session.user._id) || req.session.user.isAdmin) {
        res.render('films/edit.ejs', { film });
    } else {
        res.render('error', { errorMessage: 'You do not have permission to edit this film.' });
    }
} catch (error) {
    console.log(error);
    res.redirect('/films');
}
});

//Update route
router.put('/:filmId', isSignedIn, isAdmin, async (req,res) => {
    try {
        const filmToUpdate = await Film.findById(req.params.filmId)
        if(!filmToUpdate) throw new Error('No Film to update')
            //check ownership

        // Admins can update any film, others can only update their own films
        if (filmToUpdate.owner.equals(req.session.user._id) || req.session.user.isAdmin) {
            await filmToUpdate.updateOne(req.body);
            res.redirect(`/films/${req.params.filmId}`);
        } else {
            res.render('error', { errorMessage: 'You do not have permission to update this film.' });
        }
    } catch (error) {
        console.log(error);
        res.redirect('/films');
    }
});

// Favorite route (add "isSignedIn")
router.post('/:filmId/favorited-by/:userId', isSignedIn, async (req, res) => {
    try {
        const filmId = req.params.filmId;
        const updatedFilm = await Film.findByIdAndUpdate(filmId, {
            $push: { favoritedByUsers: req.session.user._id },
        });
        res.redirect(`/films/${filmId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/films');
    }
});

// Unfavorite route (add "isSignedIn")
router.delete('/:filmId/favorited-by/:userId', isSignedIn, async (req, res) => {
    try {
        const filmId = req.params.filmId;
        const film = await Film.findByIdAndUpdate(filmId, {
            $pull: { favoritedByUsers: req.session.user._id },
        });
        req.session.message = "Film was successfully unfavorited.";
        res.redirect(`/films/${filmId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});


  
  

module.exports = router;
