require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const Film = require('./models/film');
const passUserToView = require('./middleware/pass-user-to-view.js');

// Controllers / Routes
const authController = require("./controllers/auth.js");
const filmsController = require('./controllers/films');
const adminController = require('./controllers/admin'); // Add this line

// Constants
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session configuration with enhanced security
app.use(session({
    secret: process.env.SESSION_SECRET, // Ensure this is a strong, unique secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
        httpOnly: true, // Mitigates XSS attacks
        secure: process.env.NODE_ENV === 'production', // Ensures cookies are sent over HTTPS in production
        maxAge: 1000 * 60 * 60 * 24, // Session expires after 24 hours
        sameSite: 'lax' // Helps prevent CSRF attacks
    }
}));

app.use(passUserToView);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Make `user` available in all templates
    res.locals.showAuthLinks = !req.session.user; // Show auth links if the user is not logged in
    next();
});

app.use((req, res, next) => {
    if (req.session.message) {
        res.locals.message = req.session.message;
        req.session.message = null;
    }
    next();
});

app.use('/admin', adminController);

// Landing page
app.get('/user/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in');
    }

    try {
        const featuredMovies = await Film.find().limit(5);
        const newReleases = await Film.find({ 
            yearReleased: new Date().getFullYear()
        }).limit(5);
        const topRatedMovies = await Film.find().sort({ averageRating: -1 }).limit(5);

        res.render('user/dashboard', {
            featuredMovies,
            newReleases,
            topRatedMovies,
            user: req.session.user
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/admin/dashboard', (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/auth/sign-in');
    }

    res.render('admin/dashboard', { user: req.session.user });
});

app.get('/', async (req, res) => {
    try {
        console.log("Fetching movies...");

        const featuredMovies = await Film.find().limit(5);
        const newReleases = await Film.find({ 
            yearReleased: new Date().getFullYear()
        }).limit(5);
        const topRatedMovies = await Film.find().sort({ averageRating: -1 }).limit(5);

        console.log("🎥 Featured Movies:", featuredMovies); // Log the result
        console.log("🆕 New Releases:", newReleases);
        console.log("⭐ Top Rated Movies:", topRatedMovies);

        res.render('index', {
            featuredMovies,
            newReleases,
            topRatedMovies,
            user: req.session.user
        });
    } catch (error) {
        console.error("❌ Error fetching movies:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Auth
app.use("/auth", authController);
app.use('/films', filmsController);

// Connections
const connect = async () => {
    try {
        console.log("MongoDB URI in Production:", process.env.MONGODB_URI || "Not Set"); // 🔥 Debugging
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connection established');
        
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.log("❌ MongoDB Connection Error:", error);
    }
};
connect();

// 404 handler
app.get('*', (req, res) => {
    res.render('404.ejs');
});