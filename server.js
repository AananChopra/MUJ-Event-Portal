/**
 * Event Registration System - Main Server File
 * 
 * This file sets up the Express server, configures middleware,
 * and connects all routes for the event registration system.
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import route handlers
const eventRoutes = require('./routes/eventRoutes');
const registerRoutes = require('./routes/registerRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Cookie parser middleware
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'event-registration-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Parse URL-encoded bodies (form data)
// This middleware allows us to access form data via req.body
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (for API requests if needed)
app.use(express.json());

// Serve static files from the 'public' directory
// This allows direct access to CSS, JS, and image files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
// EJS allows us to create dynamic HTML templates
app.set('view engine', 'ejs');

// Set the views directory
// This tells Express where to find our .ejs template files
app.set('views', path.join(__dirname, 'views'));

// ============================================
// ROUTE HANDLING
// ============================================

// Make user data available to all views
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

// Mount authentication routes
app.use('/', authRoutes);

// Mount event routes
// All routes defined in eventRoutes.js will be prefixed with '/'
app.use('/', eventRoutes);

// Mount registration routes
// All routes defined in registerRoutes.js will be prefixed with '/'
app.use('/', registerRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler - catches any routes that don't match
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Global error handler
// This catches any errors thrown in route handlers
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', {
        title: '500 - Server Error',
        message: 'An internal server error occurred. Please try again later.'
    });
});

// ============================================
// SERVER STARTUP
// ============================================

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Event Registration System is ready!`);
});

