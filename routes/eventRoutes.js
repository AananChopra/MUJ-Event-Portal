/**
 * Event Routes
 * 
 * This file handles all routes related to displaying events.
 * Uses Express Router for modular route organization.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /
 * Home page - Displays all available events
 * 
 * This route fetches all events from local JSON storage and renders
 * them on the index page with Bootstrap styling.
 * Public route - no authentication required.
 */
router.get('/', async (req, res) => {
    try {
        // Query the local storage to fetch all events
        // Events are automatically sorted by date
        const result = await db.query(
            'SELECT * FROM events ORDER BY date ASC'
        );
        
        // db.query returns [events], so extract the first element
        const events = (Array.isArray(result) && result.length > 0) ? result[0] : [];
        
        console.log('Home page - Events fetched:', Array.isArray(events) ? events.length : 0, 'events');
        if (Array.isArray(events) && events.length > 0) {
            console.log('Sample event:', events[0]);
        }
        
        // Render the index.ejs template with the events data
        // The events array will be available in the template as 'events'
        res.render('index', {
            title: 'MUJ Events',
            events: Array.isArray(events) ? events : [],
            message: req.query.message || null, // For success/error messages
            messageType: req.query.type || null
        });
    } catch (error) {
        // Error handling: Log the error and render error page
        console.error('Error fetching events:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load events. Please try again later.'
        });
    }
});

/**
 * GET /event/:eventId
 * Event details page with list of students attending
 * 
 * Shows event details and list of all students registered for this event.
 */
router.get('/event/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;

        // Validate eventId
        if (!eventId) {
            return res.redirect('/?message=Invalid event ID&type=danger');
        }

        // Fetch event details
        const [events] = await db.query(
            'SELECT * FROM events WHERE id = ?',
            [eventId]
        );

        if (!events || events.length === 0) {
            return res.redirect('/?message=Event not found&type=danger');
        }

        const event = events[0];

        // Fetch all registrations for this event
        const registrations = await db.getRegistrationsByEventId(eventId);

        // Render event details page
        res.render('event-details', {
            title: event.title,
            event: event,
            registrations: registrations || [],
            message: req.query.message || null,
            messageType: req.query.type || null
        });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load event details. Please try again.'
        });
    }
});

// Export the router to be used in server.js
module.exports = router;
