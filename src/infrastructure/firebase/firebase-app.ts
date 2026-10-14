import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth, type Auth, type Persistence } from '@firebase/auth';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import type { Env } from '../env';

// Metro carga la versión React Native de @firebase/auth, que incluye esta función;
// los tipos de TypeScript solo describen la versión web, por eso se importa así.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

export type FirebaseServices = { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage };

let instance: FirebaseServices | null = null;

/** Singleton: Firebase se inicializa una sola vez y la sesión persiste en el teléfono. */
export const getFirebase = (config: Env['firebase']): FirebaseServices => {
  if (instance) return instance;
  const app = getApps().length ? getApp() : initializeApp(config);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app);
  }
  instance = { app, auth, db: getFirestore(app), storage: getStorage(app) };
  return instance;
};
