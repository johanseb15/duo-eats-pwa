
import * as admin from 'firebase-admin';

// This is a server-side only file.

// Keep track of the app instance
let adminApp: admin.app.App;

/**
 * Initializes and returns the Firebase Admin App instance.
 * This function ensures that the app is initialized only once (singleton pattern).
 * Throws an error if the required environment variables are not set.
 * @returns {admin.app.App} The initialized Firebase Admin App.
 */
function initializeAdminApp(): admin.app.App {
  // Check if the required environment variables are set
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('Firebase Admin SDK environment variables are not set. Admin features will be disabled.');
    throw new Error('Firebase Admin SDK environment variables are not configured. Please check your .env file.');
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    // The private key must be formatted correctly.
    // In your .env file, it should be enclosed in quotes like this:
    // GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n ... \\n-----END PRIVATE KEY-----\\n"
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  if (!admin.apps.length) {
    console.log("Initializing Firebase Admin SDK...");
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    return admin.app();
  }
}

/**
 * Returns the singleton instance of the Firebase Admin App.
 * If the app is not initialized, it will attempt to initialize it.
 * @returns {admin.app.App} The Firebase Admin App instance.
 */
export function getAdminApp(): admin.app.App {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}
