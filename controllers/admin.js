const express = require('express');
const router = express.Router();
const Film = require('../models/film');

// ✅ FIX: Ensure errorMessage is always passed to prevent rendering issues
router.get('/sign-in', (req, res) => {
    if (req.session.user?.isAdmin) {
        return res.redirect('/admin/dashboard'); // Redirect logged-in admins
    }
    res.render('auth/admin-sign-in', { errorMessage: null }); // Pass errorMessage
});

// ✅ FIX: Ensure POST route matches form action in EJS
router.post('/sign-in', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_CODE) {
            req.session.user = {
                username: process.env.ADMIN_USERNAME,
                _id: 'admin',
                isAdmin: true
            };

            req.session.save(() => {
                res.redirect('/admin/dashboard');
            });
        } else {
            return res.render('auth/admin-sign-in', { errorMessage: 'Invalid credentials. Please try again.' });
        }

    } catch (error) {
        console.error('Error during admin sign-in:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Admin Dashboard Route
router.get('/dashboard', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.redirect('/auth/sign-in'); // Redirect if not admin
        }

        const films = await Film.find();

        res.render('admin/dashboard', {
            films,
            user: req.session.user,
        });
    } catch (error) {
        console.error('Error fetching films:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
