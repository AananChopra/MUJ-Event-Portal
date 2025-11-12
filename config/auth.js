/**
 * Authentication Middleware
 * 
 * This file provides middleware functions for protecting routes
 * and verifying user authentication and roles.
 */

const { admin } = require('./firebase');
const db = require('./db');

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} Decoded token with user info
 */
async function verifyToken(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

/**
 * Get user role from local storage
 * @param {string} uid - Firebase user ID
 * @returns {Promise<string>} User role ('admin' or 'student')
 */
async function getUserRole(uid) {
    try {
        const user = await db.getUserByUid(uid);
        return user ? user.role : 'student'; // Default to student
    } catch (error) {
        return 'student'; // Default to student if error
    }
}

/**
 * Middleware to check if user is authenticated
 * Expects Firebase ID token in session or cookie
 */
async function requireAuth(req, res, next) {
    try {
        // Get token from session or cookie
        const idToken = req.session?.idToken || req.cookies?.idToken;
        
        if (!idToken) {
            return res.redirect('/login?message=Please login to continue&type=warning');
        }

        // Verify token
        const decodedToken = await verifyToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email
        };

        // Get user role
        req.user.role = await getUserRole(decodedToken.uid);
        req.session.user = req.user;

        next();
    } catch (error) {
        console.error('Auth error:', error);
        req.session.destroy();
        res.clearCookie('idToken');
        return res.redirect('/login?message=Session expired. Please login again&type=danger');
    }
}

/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req, res, next) {
    await requireAuth(req, res, async () => {
        if (req.user.role !== 'admin') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You do not have permission to access this page. Admin access required.'
            });
        }
        next();
    });
}

/**
 * Middleware to check if user is student
 */
async function requireStudent(req, res, next) {
    await requireAuth(req, res, async () => {
        if (req.user.role !== 'student' && req.user.role !== 'admin') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You do not have permission to access this page.'
            });
        }
        next();
    });
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireStudent,
    verifyToken,
    getUserRole
};

