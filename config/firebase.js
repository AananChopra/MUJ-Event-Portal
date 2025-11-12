/**
 * Firebase Configuration
 * 
 * This file initializes Firebase Admin SDK for server-side authentication.
 * Firebase Auth is handled on the client side, but we verify tokens on the server.
 */

const admin = require('firebase-admin');

// Firebase configuration from client
const firebaseConfig = {
    apiKey: "AIzaSyCXIoEUxFgiAxSiXXZ7ydu5WhgZ20QItf8",
    authDomain: "aanan-webtech.firebaseapp.com",
    projectId: "aanan-webtech",
    storageBucket: "aanan-webtech.firebasestorage.app",
    messagingSenderId: "329041443587",
    appId: "1:329041443587:web:3ab5e2ffe6f069ce37c736"
};

// Check if we're using emulator or production
const USE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST || process.env.USE_FIREBASE_EMULATOR === 'true';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const appOptions = {
            projectId: firebaseConfig.projectId,
        };

        // For local development, use application default credentials or emulator
        // For production, you should use a service account key file
        const path = require('path');
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                                   path.join(__dirname, '..', 'serviceAccountKey.json');
        
        // Try to load service account key file
        try {
            const serviceAccount = require(serviceAccountPath);
            appOptions.credential = admin.credential.cert(serviceAccount);
            console.log('✅ Firebase Admin initialized with service account');
        } catch (serviceAccountError) {
            // Service account not found, try emulator or show error
            if (USE_EMULATOR) {
            // Use emulator (no credentials needed)
            process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
            // For emulator, we can use a mock credential
            appOptions.credential = admin.credential.cert({
                projectId: firebaseConfig.projectId,
                privateKey: "-----BEGIN PRIVATE KEY-----\nMOCK_KEY_FOR_EMULATOR\n-----END PRIVATE KEY-----\n",
                clientEmail: "firebase-adminsdk@mock.iam.gserviceaccount.com"
            });
                console.log('✅ Firebase Admin initialized with emulator');
            } else {
                // No credentials provided - show helpful error
                console.error('❌ Service account key not found at:', serviceAccountPath);
                throw new Error(
                    'Firebase credentials not found!\n\n' +
                    'Please set up one of the following:\n' +
                    '1. Service Account Key: Place serviceAccountKey.json in project root\n' +
                    '   (Download from Firebase Console > Project Settings > Service Accounts)\n' +
                    '2. Firebase Emulator: Set USE_FIREBASE_EMULATOR=true in .env\n' +
                    '   (Run: firebase emulators:start --only firestore)\n\n' +
                    'See FIRESTORE_SETUP.md for detailed instructions.'
                );
            }
        }

        admin.initializeApp(appOptions);
        
        // Configure Firestore to use emulator if specified
        if (USE_EMULATOR) {
            const db = admin.firestore();
            db.settings({
                host: process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080',
                ssl: false
            });
            console.log('✅ Firestore emulator configured');
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        console.error('💡 To fix this, you can:');
        console.error('   1. Use Firebase Emulator: Set USE_FIREBASE_EMULATOR=true');
        console.error('   2. Use Service Account: Set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json');
        console.error('   3. Download service account key from Firebase Console > Project Settings > Service Accounts');
        throw error;
    }
}

// Export Firebase Admin and config
module.exports = {
    admin,
    firebaseConfig
};


