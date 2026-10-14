/**
 * Configuración pública leída en tiempo de compilación.
 * Expo solo incrusta las variables EXPO_PUBLIC_* cuando se leen así, de forma directa.
 */
export const env = {
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  cloudinary: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
    uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
  },
};

export type Env = typeof env;

export const hasFirebase = (config: Env = env): boolean =>
  config.firebase.apiKey.length > 10 && config.firebase.projectId.length > 0;

export const hasCloudinary = (config: Env = env): boolean =>
  config.cloudinary.cloudName.length > 0 && config.cloudinary.uploadPreset.length > 0;

export const APP_VERSION = '0.3.0';
