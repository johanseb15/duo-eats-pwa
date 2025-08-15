
/**
 * HOW TO RUN THIS SCRIPT:
 * 1. Make sure you have created a .env file in the root of the project.
 * 2. Add your Firebase Admin SDK credentials to the .env file.
 *    You can get these from your Firebase project settings -> Service accounts.
 *    Example:
 *    GOOGLE_APPLICATION_CREDENTIALS="..."
 *    GOOGLE_CLIENT_EMAIL="firebase-adminsdk-..."
 *    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."
 *    NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
 * 3. Run the following command in your terminal:
 *    npm run import:data
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import products from '../data/productos-test.json';

// Load environment variables from .env file
config();

// Check if the required environment variables are set
if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('Firebase Admin SDK environment variables are not set. Please check your .env file.');
  process.exit(1);
}

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function importData() {
  console.log('Starting data import...');

  const productsCollection = db.collection('products');
  const batch = db.batch();

  products.forEach(product => {
    // Use the ID from the JSON file or let Firestore generate one
    const docRef = productsCollection.doc(product.id);
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log(`Successfully imported ${products.length} products!`);
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

importData();
