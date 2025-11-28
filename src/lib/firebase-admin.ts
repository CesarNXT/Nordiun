import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (projectId && clientEmail && privateKey) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

export const adminApp = admin.apps.length ? admin.app() : null;
export const adminAuth = adminApp ? admin.auth() : null;
export const adminDb = adminApp ? admin.firestore() : null;

