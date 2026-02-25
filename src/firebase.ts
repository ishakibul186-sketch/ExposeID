import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDCF9-QchK4cVsQH6IwFN1ZNl3be0-lI50",
  authDomain: "shakibul-islam-ltd-server.firebaseapp.com",
  databaseURL: "https://shakibul-islam-ltd-server-default-rtdb.firebaseio.com",
  projectId: "shakibul-islam-ltd-server",
  storageBucket: "shakibul-islam-ltd-server.appspot.com",
  messagingSenderId: "896191957877",
  appId: "1:896191957877:web:5c41a87a8fbb0c14a5e13c",
  measurementId: "G-BLW3ZJVHL5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const rtdb = getDatabase(app);

// Use initializeFirestore with experimentalForceLongPolling for better stability in some proxy environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false, // Force it, don't just detect
});

export const storage = getStorage(app);
// Analytics only works in browser environments with window
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { enableNetwork, disableNetwork };
export default app;
