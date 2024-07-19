const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');


// Routes / Controllers
router.get("/sign-up", (req, res) => {
    res.render('auth/sign-up.ejs');
  });

  //POST /auth/sign-up

  router.post('/sign-up', async (req, res) => {
    //1. Check for existing user with same username
    // Send error if founds.
    const userInDatabase = await User.findOne({ username: req.body.username });
if (userInDatabase) {
    //Return keyword here is very important.
    // If we forget it, the function will keep executing,
    // leading to further responses being sent.
    //We can't send multiple responses, so our server would just crash.
  return res.send('Username already taken.');
  }


  //2. Checking password and confirmPassword match
  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Passwords do not match");
  }



  // 3. Hashing plain text password for security purposes
  
  req.body.password = bcrypt.hashSync(req.body.password, 12)

// 4. Create the user document
const user = await User.create(req.body);
return res.send(`Thanks for signing up ${user.username}`);

})
 
//-in /auth/sign
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
        res.redirect("/sign-in")
  }
// Add username to session user
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  };


  // Once authenticated and session saved, redirect back to home page
  req.session.save(() => {
    res.redirect("/");
  });
 
  });

  // Sign out
  // GET /auth/sign-out
  router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
    res.redirect('/')
    })
 });
  
  

module.exports = router;
