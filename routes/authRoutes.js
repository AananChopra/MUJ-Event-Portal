/**
 * Authentication Routes
 * 
 * This file handles user authentication: login, register, and logout.
 * Uses Firebase Authentication on the client side.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../config/auth');

/**
 * GET /login
 * Login page
 */
router.get('/login', (req, res) => {
    // Redirect if already logged in
    if (req.session?.user) {
        return res.redirect('/');
    }
    res.render('login', {
        title: 'Login',
        message: req.query.message || null,
        messageType: req.query.type || null
    });
});

/**
 * GET /register
 * Registration page
 */
router.get('/register', (req, res) => {
    // Redirect if already logged in
    if (req.session?.user) {
        return res.redirect('/');
    }
    res.render('register-auth', {
        title: 'Register',
        message: req.query.message || null,
        messageType: req.query.type || null
    });
});

/**
 * POST /api/auth/login
 * Handle Firebase login token
 * Client sends Firebase ID token after successful authentication
 */
router.post('/api/auth/login', async (req, res) => {
    try {
        const { idToken, userData } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID token is required' });
        }

        // Verify token with Firebase Admin
        const { admin } = require('../config/firebase');
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Get or create user in Firestore
        let user = await db.getUserByUid(decodedToken.uid);
        if (!user) {
            // Create new user with role from request or default to student
            try {
                user = await db.createUser({
                    uid: decodedToken.uid,
                    email: decodedToken.email || userData?.email,
                    name: decodedToken.name || userData?.name || decodedToken.email,
                    role: userData?.role || 'student' // Use role from request or default to student
                });
            } catch (createError) {
                // If Firestore is not enabled, provide helpful error
                if (createError.message && createError.message.includes('Firestore database not enabled')) {
                    console.error('❌ Firestore not enabled. Please enable it in Firebase Console.');
                    return res.status(500).json({ 
                        error: 'Database not configured. Please enable Firestore in Firebase Console. See FIRESTORE_ENABLE.md for instructions.' 
                    });
                }
                throw createError;
            }
        }

        // Store in session
        req.session.idToken = idToken;
        req.session.user = {
            uid: user.uid,
            email: user.email,
            name: user.name,
            role: user.role
        };

        res.json({
            success: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

/**
 * POST /api/auth/logout
 * Handle logout
 */
router.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

/**
 * GET /logout
 * Logout page (redirects after logout)
 */
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.redirect('/login?message=Logged out successfully&type=success');
    });
});

/**
 * GET /profile
 * User profile page
 */
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await db.getUserByUid(req.user.uid);
        res.render('profile', {
            title: 'My Profile',
            user: user || req.user,
            message: req.query.message || null,
            messageType: req.query.type || null
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load profile.'
        });
    }
});

module.exports = router;

