/**
 * Local Data Setup Script
 * 
 * This script initializes the local JSON data files with seed data.
 * Run this script to create the data directory and populate initial events.
 * 
 * Usage: node setup-db.js
 */

const fs = require('fs').promises;
const path = require('path');

// Data directory and file paths
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Seed data for events
 */
const seedEvents = [
    {
        id: 1,
        title: 'Tech Innovators Summit',
        date: '2025-12-01',
        venue: 'Auditorium A'
    },
    {
        id: 2,
        title: 'AI Workshop',
        date: '2025-12-05',
        venue: 'Lab 3'
    },
    {
        id: 3,
        title: 'Cultural Fest',
        date: '2025-12-10',
        venue: 'Main Ground'
    }
];

/**
 * Main setup function
 * Creates data directory and initializes JSON files
 */
async function setupData() {
    try {
        console.log('📁 Creating data directory...');
        
        // Create data directory if it doesn't exist
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log('✅ Data directory created');
        
        // Check if events file already exists
        let eventsExist = false;
        try {
            await fs.access(EVENTS_FILE);
            eventsExist = true;
        } catch {
            eventsExist = false;
        }
        
        if (!eventsExist) {
            // Create events.json with seed data
            console.log('\n📋 Creating events.json with seed data...');
            await fs.writeFile(
                EVENTS_FILE,
                JSON.stringify(seedEvents, null, 2),
                'utf8'
            );
            console.log('✅ Events file created with seed data');
        } else {
            // Read existing events
            const existingEvents = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf8'));
            console.log(`\n⚠️  Events file already exists with ${existingEvents.length} event(s).`);
            console.log('   Skipping seed data insertion.');
        }
        
        // Create empty registrations.json if it doesn't exist
        let registrationsExist = false;
        try {
            await fs.access(REGISTRATIONS_FILE);
            registrationsExist = true;
        } catch {
            registrationsExist = false;
        }
        
        if (!registrationsExist) {
            console.log('\n📋 Creating registrations.json...');
            await fs.writeFile(
                REGISTRATIONS_FILE,
                JSON.stringify([], null, 2),
                'utf8'
            );
            console.log('✅ Registrations file created (empty)');
        } else {
            const existingRegistrations = JSON.parse(await fs.readFile(REGISTRATIONS_FILE, 'utf8'));
            console.log(`\n⚠️  Registrations file already exists with ${existingRegistrations.length} registration(s).`);
        }
        
        // Create empty users.json if it doesn't exist
        let usersExist = false;
        try {
            await fs.access(USERS_FILE);
            usersExist = true;
        } catch {
            usersExist = false;
        }
        
        if (!usersExist) {
            console.log('\n📋 Creating users.json...');
            await fs.writeFile(
                USERS_FILE,
                JSON.stringify([], null, 2),
                'utf8'
            );
            console.log('✅ Users file created (empty)');
        } else {
            const existingUsers = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
            console.log(`\n⚠️  Users file already exists with ${existingUsers.length} user(s).`);
        }
        
        // Verify setup
        console.log('\n🔍 Verifying setup...');
        const events = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf8'));
        const registrations = JSON.parse(await fs.readFile(REGISTRATIONS_FILE, 'utf8'));
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        
        console.log(`\n📊 Data Summary:`);
        console.log(`   - Events: ${events.length} record(s)`);
        console.log(`   - Registrations: ${registrations.length} record(s)`);
        console.log(`   - Users: ${users.length} record(s)`);
        
        if (events.length > 0) {
            console.log(`\n📅 Available Events:`);
            events.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.title} - ${event.date} at ${event.venue}`);
            });
        }
        
        console.log('\n✅ Local data setup completed successfully!');
        console.log('📂 Data files are stored in: ' + DATA_DIR);
        console.log('🚀 You can now start the server with: node server.js\n');
        
    } catch (error) {
        console.error('\n❌ Error setting up data:', error.message);
        process.exit(1);
    }
}

// Run the setup
console.log('='.repeat(50));
console.log('   Event Registration System - Data Setup');
console.log('='.repeat(50));
setupData();
