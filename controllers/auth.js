const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const Film = require('../models/film');  // Make sure this is required at the top of the file

// User Registration Route
router.get("/sign-up", (req, res) => {
    res.render('auth/sign-up.ejs');
});

router.post('/sign-up', async (req, res) => {
  try {
      const { username, password, confirmPassword, adminUsername, adminPassword } = req.body;

      // Check if username already exists
      const userInDatabase = await User.findOne({ username });
      if (userInDatabase) {
          return res.send('Username already taken.');
      }

      // Check if passwords match
      if (password !== confirmPassword) {
          return res.send("Passwords do not match");
      }

      // Hash the password for the new user
      const hashedPassword = await bcrypt.hash(password, 12);

      // Default isAdmin to false
      let isAdmin = false;

      // Authenticate the admin (if provided)
      if (adminUsername && adminPassword) {
          // Check if provided admin credentials are correct
          const adminUser = await User.findOne({ username: adminUsername });
          if (adminUser && await bcrypt.compare(adminPassword, adminUser.password)) {
              // If admin credentials are correct, allow isAdmin to be true
              isAdmin = true;
          } else {
              return res.send('Invalid admin credentials.');
          }
      }

      // Create the new user with isAdmin flag
      const newUser = await User.create({
          username,
          password: hashedPassword,
          isAdmin
      });

      // Store user info in session
      req.session.user = {
          username: newUser.username,
          _id: newUser._id,
          isAdmin: newUser.isAdmin // Store the isAdmin status
      };

      req.session.save(() => {
          // Redirect to appropriate page based on user role
          res.redirect(isAdmin ? '/admin/dashboard' : '/user/dashboard');
      });

  } catch (error) {
      console.error('Error during sign-up:', error);
      res.status(500).send('Internal Server Error');
  }
});



// Regular User Sign-In Routes
router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in');
});

router.post("/sign-in", async (req, res) => {
  try {
      const { username, password } = req.body;

      // Find user by username
      const userInDatabase = await User.findOne({ username });
      if (!userInDatabase) {
          return res.send('Login failed. Please try again.');
      }

      // Validate password
      const validPassword = await bcrypt.compare(password, userInDatabase.password);
      if (!validPassword) {
          return res.send('Login failed. Please try again.');
      }

      // Store user info in session
      req.session.user = {
          username: userInDatabase.username,
          _id: userInDatabase._id,
          isAdmin: userInDatabase.isAdmin // Store isAdmin status
      };

      req.session.save(() => {
          // Redirect based on role
          if (userInDatabase.isAdmin) {
              res.redirect("/admin/dashboard"); // Admin dashboard route
          } else {
              res.redirect("/user/dashboard"); // Regular user dashboard route
          }
      });
  } catch (error) {
      console.error('Error during sign-in:', error);
      res.status(500).send('Internal Server Error');
  }
});



// Sign-Out Route
router.get('/sign-out', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).send('Failed to log out.');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/'); // Redirect to the homepage or a valid route
    });
});

module.exports = router;
