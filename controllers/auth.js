const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');



router.get("/sign-up", (req, res) => {
    res.render('auth/sign-up.ejs');
  });

  router.post('/sign-up', async (req, res) => {
  
    const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
  
        return res.send('Username already taken.');
  }

          if (req.body.password !== req.body.confirmPassword) {
              return res.send("Passwords do not match");
  }

req.body.password = bcrypt.hashSync(req.body.password, 12)

const user = await User.create(req.body);
    return res.send(`Thanks for signing up ${user.username}`);
})

router.get('/sign-in', async (req, res) => {
    return res.render('auth/sign-in');
  });
  
  router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
if (!userInDatabase) {
    console.log('User does not exist in datatbase')
    return res.send('Login failed. Please try again.');
  
}
    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
   
    if (!validPassword) {
        console.log('User exists but password did not match')
        return res.send('Login failed. Please try again.');    
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  };

  req.session.save(() => {
    res.redirect("/");
  });
 
  });

  router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
    res.redirect('/')
    })
 });
  
  

module.exports = router;
