import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, connectFirestoreEmulator, initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const bucketEnv = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: bucketEnv.startsWith("gs://") ? bucketEnv.slice(5) : bucketEnv,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const hasConfig = Boolean(firebaseConfig.apiKey);
let app: FirebaseApp;
if (getApps().length) {
  app = getApps()[0]!;
} else {
  app = hasConfig ? initializeApp(firebaseConfig) : initializeApp({ projectId: "nordiun-demo" });
}

export const auth: Auth | null = hasConfig ? getAuth(app) : null;
export const db: Firestore = (() => {
  setLogLevel("silent");
  if (hasConfig) {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true, useFetchStreams: true });
  }
  const f = getFirestore(app);
  try { connectFirestoreEmulator(f, "localhost", 8080); } catch {}
  return f;
})();
export const storage: FirebaseStorage | null = hasConfig ? getStorage(app) : null;

if (!hasConfig) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
}
