
import * as admin from 'firebase-admin';

// This is a server-side only file.
// It is used to initialize the Firebase Admin SDK.

let adminApp: admin.app.App | undefined;

// Check if the required environment variables are set
if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    // The private key must be formatted correctly.
    // In your .env file, it should be enclosed in quotes like this:
    // GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n ... \\n-----END PRIVATE KEY-----\\n"
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };
  
  if (!admin.apps.length) {
      try {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
      } catch (error: any) {
        console.error("Firebase Admin initialization error:", error.message);
      }
  } else {
      adminApp = admin.app();
  }
} else {
    console.warn("Firebase Admin SDK environment variables are not set. Admin features will be disabled.");
}


export { adminApp };
