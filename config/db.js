/**
 * Firestore Database Configuration
 * 
 * This file provides a Firestore-based data storage system.
 * Data is stored in Firestore collections.
 * 
 * ============================================
 * DATA STRUCTURE
 * ============================================
 * 
 * Firestore Collections:
 * - events: Event documents
 *   { id: "auto", title: "...", date: "...", venue: "..." }
 * 
 * - registrations: Registration documents
 *   { id: "auto", name: "...", email: "...", event_id: "..." }
 * 
 * - users: User documents
 *   { uid: "...", email: "...", name: "...", role: "..." }
 * 
 * ============================================
 */

const { admin } = require('./firebase');

// Get Firestore instance
const db = admin.firestore();

// Collection references
const EVENTS_COLLECTION = db.collection('events');
const REGISTRATIONS_COLLECTION = db.collection('registrations');
const USERS_COLLECTION = db.collection('users');

console.log('✅ Firestore database initialized');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Firestore document to plain object with ID
 */
function docToObject(doc) {
    if (!doc.exists) return null;
    return {
        id: doc.id,
        ...doc.data()
    };
}

/**
 * Convert Firestore query snapshot to array of objects
 */
function snapshotToArray(snapshot) {
    const results = [];
    snapshot.forEach(doc => {
        results.push(docToObject(doc));
    });
    return results;
}

// ============================================
// EVENTS OPERATIONS
// ============================================

/**
 * Get all events
 * @returns {Promise<Array>} Array of all events
 */
async function getAllEvents() {
    try {
        const snapshot = await EVENTS_COLLECTION.orderBy('date', 'asc').get();
        const events = snapshotToArray(snapshot);
        console.log(`📋 Fetched ${events.length} events from Firestore`);
        return events;
    } catch (error) {
        // Check if it's a NOT_FOUND error (database not enabled)
        if (error.code === 5 || error.code === 'NOT_FOUND') {
            console.error('❌ Firestore database not found. Please enable Firestore in Firebase Console.');
            return [];
        }
        console.error('❌ Error fetching events:', error);
        return [];
    }
}

/**
 * Get event by ID
 * @param {string|number} id - Event ID
 * @returns {Promise<Object|null>} Event object or null if not found
 */
async function getEventById(id) {
    try {
        const doc = await EVENTS_COLLECTION.doc(String(id)).get();
        return docToObject(doc);
    } catch (error) {
        // NOT_FOUND (code 5) is normal when document doesn't exist
        if (error.code === 5 || error.code === 'NOT_FOUND') {
            return null;
        }
        console.error('❌ Error fetching event by ID:', error);
        return null;
    }
}

/**
 * Create a new event
 * @param {Object} eventData - Event data (title, date, venue)
 * @returns {Promise<Object>} Created event with ID
 */
async function createEvent(eventData) {
    try {
        console.log('📝 Creating new event in Firestore:', eventData);
        
        // Add event to Firestore (ID will be auto-generated)
        const docRef = await EVENTS_COLLECTION.add({
            title: eventData.title,
            date: eventData.date,
            venue: eventData.venue,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Get the created document
        const doc = await docRef.get();
        const newEvent = docToObject(doc);
        
        console.log('✅ Event created successfully:', newEvent);
        return newEvent;
    } catch (error) {
        // Check if it's a NOT_FOUND error (database not enabled)
        if (error.code === 5 || error.code === 'NOT_FOUND') {
            console.error('❌ Firestore database not found. Please enable Firestore in Firebase Console:');
            console.error('   1. Go to Firebase Console > Firestore Database');
            console.error('   2. Click "Create database"');
            console.error('   3. Choose "Start in test mode" (for development)');
            throw new Error('Firestore database not enabled. Please enable it in Firebase Console.');
        }
        console.error('❌ Error creating event:', error);
        throw error;
    }
}

/**
 * Delete an event
 * @param {string|number} id - Event ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteEvent(id) {
    try {
        await EVENTS_COLLECTION.doc(String(id)).delete();
        console.log(`✅ Event ${id} deleted successfully`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting event:', error);
        throw error;
    }
}

// ============================================
// REGISTRATIONS OPERATIONS
// ============================================

/**
 * Get all registrations
 * @returns {Promise<Array>} Array of all registrations
 */
async function getAllRegistrations() {
    try {
        const snapshot = await REGISTRATIONS_COLLECTION.get();
        return snapshotToArray(snapshot);
    } catch (error) {
        console.error('❌ Error fetching registrations:', error);
        return [];
    }
}

/**
 * Get registration by ID
 * @param {string|number} id - Registration ID
 * @returns {Promise<Object|null>} Registration object or null if not found
 */
async function getRegistrationById(id) {
    try {
        const doc = await REGISTRATIONS_COLLECTION.doc(String(id)).get();
        return docToObject(doc);
    } catch (error) {
        console.error('❌ Error fetching registration by ID:', error);
        return null;
    }
}

/**
 * Get registrations by event ID
 * @param {string|number} eventId - Event ID
 * @returns {Promise<Array>} Array of registrations for the event
 */
async function getRegistrationsByEventId(eventId) {
    try {
        const snapshot = await REGISTRATIONS_COLLECTION
            .where('event_id', '==', String(eventId))
            .get();
        return snapshotToArray(snapshot);
    } catch (error) {
        console.error('❌ Error fetching registrations by event ID:', error);
        return [];
    }
}

/**
 * Check if email is already registered for an event
 * @param {string} email - Email address
 * @param {string|number} eventId - Event ID
 * @returns {Promise<boolean>} True if already registered
 */
async function isEmailRegisteredForEvent(email, eventId) {
    try {
        const snapshot = await REGISTRATIONS_COLLECTION
            .where('email', '==', email.toLowerCase())
            .where('event_id', '==', String(eventId))
            .limit(1)
            .get();
        return !snapshot.empty;
    } catch (error) {
        console.error('❌ Error checking registration:', error);
        return false;
    }
}

/**
 * Create a new registration
 * @param {Object} registrationData - Registration data (name, email, event_id)
 * @returns {Promise<Object>} Created registration with ID
 */
async function createRegistration(registrationData) {
    try {
        const docRef = await REGISTRATIONS_COLLECTION.add({
            name: registrationData.name.trim(),
            email: registrationData.email.trim().toLowerCase(),
            event_id: String(registrationData.event_id),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        const doc = await docRef.get();
        return docToObject(doc);
    } catch (error) {
        console.error('❌ Error creating registration:', error);
        throw error;
    }
}

/**
 * Get all registrations with event details (JOIN equivalent)
 * @returns {Promise<Array>} Array of registrations with event details
 */
async function getRegistrationsWithEvents() {
    try {
        const registrations = await getAllRegistrations();
        const events = await getAllEvents();
        
        // Create a map of events by ID for quick lookup
        const eventsMap = {};
        events.forEach(event => {
            eventsMap[event.id] = event;
        });
        
        // Join registrations with events
        const result = registrations
            .map(reg => {
                const event = eventsMap[reg.event_id];
                if (!event) return null; // Skip if event not found
                
                return {
                    id: reg.id,
                    name: reg.name,
                    email: reg.email,
                    event_title: event.title,
                    event_date: event.date,
                    event_venue: event.venue
                };
            })
            .filter(reg => reg !== null) // Remove null entries
            .sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by ID descending
        
        return result;
    } catch (error) {
        console.error('❌ Error fetching registrations with events:', error);
        return [];
    }
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get user by UID
 * @param {string} uid - User UID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserByUid(uid) {
    try {
        const doc = await USERS_COLLECTION.doc(uid).get();
        return docToObject(doc);
    } catch (error) {
        // NOT_FOUND (code 5) is normal when document doesn't exist
        if (error.code === 5 || error.code === 'NOT_FOUND') {
            return null;
        }
        console.error('❌ Error fetching user by UID:', error);
        return null;
    }
}

/**
 * Create a new user
 * @param {Object} userData - User data (uid, email, name, role)
 * @returns {Promise<Object>} Created user
 */
async function createUser(userData) {
    try {
        // Check if user already exists
        const existing = await getUserByUid(userData.uid);
        if (existing) {
            return existing;
        }
        
        const userDoc = {
            uid: userData.uid,
            email: userData.email,
            name: userData.name || userData.email,
            role: userData.role || 'student',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await USERS_COLLECTION.doc(userData.uid).set(userDoc);
        
        // Get the created document to return
        const doc = await USERS_COLLECTION.doc(userData.uid).get();
        return docToObject(doc);
    } catch (error) {
        // Check if it's a NOT_FOUND error (database not enabled)
        if (error.code === 5 || error.code === 'NOT_FOUND') {
            console.error('❌ Firestore database not found. Please enable Firestore in Firebase Console:');
            console.error('   1. Go to Firebase Console > Firestore Database');
            console.error('   2. Click "Create database"');
            console.error('   3. Choose "Start in test mode" (for development)');
            throw new Error('Firestore database not enabled. Please enable it in Firebase Console.');
        }
        console.error('❌ Error creating user:', error);
        throw error;
    }
}

/**
 * Update user role
 * @param {string} uid - User UID
 * @param {string} role - New role
 * @returns {Promise<Object|null>} Updated user or null if not found
 */
async function updateUserRole(uid, role) {
    try {
        await USERS_COLLECTION.doc(uid).update({
            role: role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return await getUserByUid(uid);
    } catch (error) {
        console.error('❌ Error updating user role:', error);
        return null;
    }
}

// ============================================
// MOCK DATABASE INTERFACE
// ============================================
// This object mimics the MySQL query interface for easy migration

const dbInterface = {
    /**
     * Mock query method that mimics MySQL query interface
     * Supports common query patterns used in routes
     */
    async query(sql, params = []) {
        // Parse SQL to determine operation
        const sqlUpper = sql.trim().toUpperCase().replace(/\s+/g, ' ');
        
        console.log('🔍 DB Query called:', sql);
        console.log('🔍 SQL Upper (normalized):', sqlUpper);
        console.log('🔍 Params:', params);
        
        try {
            // INSERT INTO events (title, date, venue) VALUES (?, ?, ?)
            // Check INSERT first before SELECT to avoid conflicts
            if (sqlUpper.startsWith('INSERT INTO EVENTS') || sqlUpper.includes('INSERT INTO EVENTS')) {
                console.log('✅ INSERT INTO events matched!');
                const event = await createEvent({
                    title: params[0],
                    date: params[1],
                    venue: params[2]
                });
                console.log('✅ Created event successfully:', event);
                return [{ insertId: event.id }];
            }
            
            // SELECT * FROM events WHERE id = ?
            if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM EVENTS') && sqlUpper.includes('WHERE ID = ?')) {
                const event = await getEventById(params[0]);
                return [[event].filter(e => e !== null)];
            }
            
            // SELECT id FROM events WHERE id = ?
            if (sqlUpper.includes('SELECT ID FROM EVENTS WHERE ID = ?')) {
                const event = await getEventById(params[0]);
                return [[event].filter(e => e !== null)];
            }
            
            // SELECT * FROM events (with or without ORDER BY, but no WHERE clause)
            if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM EVENTS') && !sqlUpper.includes('WHERE')) {
                console.log('✅ SELECT * FROM events matched!');
                const events = await getAllEvents();
                console.log('Fetched events:', events.length, 'events');
                return [events];
            }
            
            // SELECT id FROM registrations WHERE email = ? AND event_id = ?
            if (sqlUpper.includes('SELECT ID FROM REGISTRATIONS WHERE EMAIL = ? AND EVENT_ID = ?')) {
                const exists = await isEmailRegisteredForEvent(params[0], params[1]);
                return exists ? [[{ id: 1 }]] : [[]];
            }
            
            // INSERT INTO registrations (name, email, event_id) VALUES (?, ?, ?)
            if (sqlUpper.includes('INSERT INTO REGISTRATIONS')) {
                const registration = await createRegistration({
                    name: params[0],
                    email: params[1],
                    event_id: params[2]
                });
                return [{ insertId: registration.id }];
            }
            
            // SELECT with JOIN (admin panel query)
            if (sqlUpper.includes('FROM REGISTRATIONS R') && sqlUpper.includes('INNER JOIN EVENTS E')) {
                const registrations = await getRegistrationsWithEvents();
                return [registrations];
            }
            
            // Default: return empty result
            console.warn('⚠️  Unmatched SQL query:', sql);
            console.warn('⚠️  SQL Upper (normalized):', sqlUpper);
            console.warn('⚠️  Checking patterns:');
            console.warn('   - INSERT INTO EVENTS:', sqlUpper.includes('INSERT INTO EVENTS'));
            console.warn('   - SELECT * FROM EVENTS:', sqlUpper.includes('SELECT * FROM EVENTS'));
            console.warn('   - Has WHERE:', sqlUpper.includes('WHERE'));
            return [[]];
        } catch (error) {
            console.error('❌ Database query error:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    },
    
    // Export helper functions
    getUserByUid,
    createUser,
    updateUserRole,
    getRegistrationsByEventId,
    deleteEvent
};

// Export the db object for use in routes
module.exports = dbInterface;
