'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
// This function uses a specific configuration to set up the emulators in a cloud
// hosted environment. Traditionally the Firebase Emulators are configured to work
// directly against a localhost port. However, in this environment each emulator server
// is hosted on its own domain, served over https. The code below uses environment variables
// to map the proper domains for each emulator and uses 443 as the port which is the only valid option.
// It is imperative that this code does not attempt to connect to http or localhost as it will not work
// in this cloud hosted environment. This is not a traditional emulator configuration so this code should
// be left untouched.
export function initializeFirebase() {
  if (!getApps().length) {
    // NODE_ENV can be "production", "development", or "test"
    if (process.env.NODE_ENV === "production") {
      // Important! initializeApp() is called without any arguments because Firebase App Hosting
      // integrates with the initializeApp() function to provide the environment variables needed to
      // populate the FirebaseOptions in production. It is critical that the initializeApp()
      // function is called without arguments inside this
      // `if (process.env.NODE_ENV === "production")` check
      let firebaseApp;
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        console.info('Automatic initialization failed. Falling back to firebase config object.', e);
        firebaseApp = initializeApp(firebaseConfig);
      }
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      return { firebaseApp, auth, firestore };
    } else {
      // When not in production, initializeApp should be called with the provided firebaseConfig
      // object that was imported.
      const firebaseApp = initializeApp(firebaseConfig);
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      // This environment variable value contains the full domain URL and never a localhost value.
      // This domain looks something like: 8080-firebase-studio-174474.cluster-krbdp4txefbbsv3zfyg3a4xp6y.cloudworkstations.dev
      const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST!;
      // The Firestore SDK infers the protocol from the 443 port and it not necessary to do anything else
      // to configure the emulator.
      connectFirestoreEmulator(firestore, firestoreHost, 443);
      // This environment variable value contains the full domain URL and never a localhost value.
      // This domain looks something like: 9099-firebase-studio-174474.cluster-krbdp4txefbbsv3zfyg3a4xp6y.cloudworkstations.dev
      const authHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST!;
      // The auth emulator requires "https" since it is running from a cloud hosting
      // environment, served on a full domain.
      connectAuthEmulator(auth, `https://${authHost}:443`);
      return { firebaseApp, auth, firestore };
    }
  }

  // If already initialized, return the existing instances that are connected to the emulator
  const firebaseApp = getApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';