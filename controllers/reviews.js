

const express = require('express');
const router = express.Router();

const Film = require('../models/film');

// we will build out our router logic here

router.get('/', async (req, res) => {
    try {
      res.render('reviews/index.ejs');
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  });

  router.get('/new', async (req, res) => {
    res.render('reviews/new.ejs');
  });






module.exports = router;
