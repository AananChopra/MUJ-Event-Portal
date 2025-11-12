/**
 * Registration Routes
 * 
 * This file handles routes for event registration and admin panel.
 * Includes GET routes for forms and POST routes for form submissions.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin, requireStudent } = require('../config/auth');

/**
 * GET /register/:eventId
 * Registration form page
 * 
 * This route displays the registration form for a specific event.
 * It fetches the event details from local storage and pre-fills the form.
 * 
 * Requires student authentication.
 */
router.get('/register/:eventId', requireStudent, async (req, res) => {
    try {
        const eventId = req.params.eventId;

        // Validate eventId
        if (!eventId) {
            return res.redirect('/?message=Invalid event ID&type=danger');
        }

        // Fetch event details from Firestore
        const [events] = await db.query(
            'SELECT * FROM events WHERE id = ?',
            [eventId]
        );

        // Check if event exists
        if (!events || events.length === 0) {
            return res.redirect('/?message=Event not found&type=danger');
        }

        const event = events[0];

        // Render registration form with event data
        res.render('register', {
            title: `Register for ${event.title}`,
            event: event,
            message: req.query.message || null,
            messageType: req.query.type || null
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load registration form. Please try again.'
        });
    }
});

/**
 * POST /register
 * Handle registration form submission
 * 
 * This route processes the registration form data:
 * 1. Validates input data
 * 2. Saves registration to local JSON file
 * 3. Redirects with success/error message
 * 
 * Requires student authentication.
 */
router.post('/register', requireStudent, async (req, res) => {
    try {
        // Extract form data from request body
        // express.urlencoded middleware makes this available
        const { name, email, event_id } = req.body;

        // Server-side validation
        if (!name || !email || !event_id) {
            return res.redirect(
                `/register/${event_id}?message=All fields are required&type=danger`
            );
        }

        // Validate email format (basic validation)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.redirect(
                `/register/${event_id}?message=Invalid email format&type=danger`
            );
        }

        // Check if event exists
        const [events] = await db.query(
            'SELECT id FROM events WHERE id = ?',
            [event_id]
        );

        if (!events || events.length === 0) {
            return res.redirect(
                `/register/${event_id}?message=Event not found&type=danger`
            );
        }

        // Check for duplicate registration (same email for same event)
        const [existing] = await db.query(
            'SELECT id FROM registrations WHERE email = ? AND event_id = ?',
            [email, event_id]
        );

        if (existing && existing.length > 0) {
            return res.redirect(
                `/register/${event_id}?message=You are already registered for this event&type=warning`
            );
        }

        // Save registration to local JSON file
        // The db.query method handles the file operations
        await db.query(
            'INSERT INTO registrations (name, email, event_id) VALUES (?, ?, ?)',
            [name.trim(), email.trim(), event_id]
        );

        // Redirect to home page with success message
        res.redirect('/?message=Registration successful!&type=success');
    } catch (error) {
        console.error('Error registering participant:', error);
        res.redirect(
            `/?message=Registration failed. Please try again.&type=danger`
        );
    }
});

/**
 * GET /admin
 * Admin panel - View all registrations
 * 
 * This route displays all registrations with event details.
 * Uses a JOIN-like operation to combine data from registrations and events.
 * Requires admin authentication.
 */
router.get('/admin', requireAdmin, async (req, res) => {
    try {
        // Fetch all registrations with event details
        // The query method performs a JOIN-like operation on JSON data
        const [registrations] = await db.query(`
            SELECT 
                r.id,
                r.name,
                r.email,
                e.title as event_title,
                e.date as event_date,
                e.venue as event_venue
            FROM registrations r
            INNER JOIN events e ON r.event_id = e.id
            ORDER BY r.id DESC
        `);

        // Render admin page with registrations data
        res.render('admin', {
            title: 'Admin Panel - All Registrations',
            registrations: registrations || [],
            message: req.query.message || null,
            messageType: req.query.type || null
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load registrations. Please try again.'
        });
    }
});

/**
 * GET /admin/events
 * Admin dashboard - Manage events
 * 
 * This route displays the admin dashboard for managing events.
 * Requires admin authentication.
 */
router.get('/admin/events', requireAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM events ORDER BY date ASC');
        // db.query returns [events], so extract the first element
        const events = (Array.isArray(result) && result.length > 0) ? result[0] : [];
        
        console.log('Admin events page - Events fetched:', Array.isArray(events) ? events.length : 0, 'events');
        if (Array.isArray(events) && events.length > 0) {
            console.log('Sample event:', events[0]);
        }
        
        res.render('admin-events', {
            title: 'Admin - Manage Events',
            events: Array.isArray(events) ? events : [],
            message: req.query.message || null,
            messageType: req.query.type || null
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load events. Please try again.'
        });
    }
});

/**
 * POST /admin/events
 * Create a new event
 * 
 * Requires admin authentication.
 */
router.post('/admin/events', requireAdmin, async (req, res) => {
    try {
        const { title, date, venue } = req.body;
        
        console.log('📥 Received event creation request:', { title, date, venue });

        // Validation
        if (!title || !date || !venue) {
            console.warn('⚠️  Validation failed: Missing required fields');
            return res.redirect('/admin/events?message=All fields are required&type=danger');
        }

        // Create event using db query interface
        console.log('🔄 Calling db.query to create event...');
        const result = await db.query(
            'INSERT INTO events (title, date, venue) VALUES (?, ?, ?)',
            [title.trim(), date, venue.trim()]
        );
        
        console.log('✅ Event creation query completed, result:', result);

        res.redirect('/admin/events?message=Event created successfully&type=success');
    } catch (error) {
        console.error('❌ Error creating event in route:', error);
        console.error('Error stack:', error.stack);
        res.redirect('/admin/events?message=Failed to create event: ' + error.message + '&type=danger');
    }
});

/**
 * POST /admin/events/:id/delete
 * Delete an event
 * 
 * Requires admin authentication.
 */
router.post('/admin/events/:id/delete', requireAdmin, async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // Delete event from Firestore
        await db.deleteEvent(eventId);

        res.redirect('/admin/events?message=Event deleted successfully&type=success');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.redirect('/admin/events?message=Failed to delete event&type=danger');
    }
});

// Export the router to be used in server.js
module.exports = router;
