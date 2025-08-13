
import * as admin from 'firebase-admin';

// This is a server-side only file.
// It is used to initialize the Firebase Admin SDK.

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  // The private key must be formatted correctly.
  // In your .env file, it should be enclosed in quotes like this:
  // GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n"
  privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

let adminApp: admin.app.App;

if (!admin.apps.length) {
    adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    adminApp = admin.app();
}

export { adminApp };
