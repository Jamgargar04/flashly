import type {
  AuthGateway, CampusDirectory, KeyValueStore, MomentRepository, PhotoCompressor, PhotoStorage, ReminderScheduler,
} from '@/domain/ports';

import { CloudinaryPhotoStorage } from './cloudinary/cloudinary-photo-storage';
import { ExpoPhotoCompressor } from './device/expo-photo-compressor';
import { ExpoReminderScheduler } from './device/expo-reminder-scheduler';
import { env, hasCloudinary, hasFirebase, type Env } from './env';
import { getFirebase } from './firebase/firebase-app';
import { FirebaseAuthGateway } from './firebase/firebase-auth-gateway';
import { FirebasePhotoStorage } from './firebase/firebase-photo-storage';
import { FirestoreMomentRepository } from './firebase/firestore-moment-repository';
import { AsyncStorageStore } from './local/async-storage-store';
import { demoMoments } from './local/demo-content';
import { LocalAuthGateway } from './local/local-auth-gateway';
import { LocalCampusDirectory } from './local/local-campus-directory';
import { LocalMomentRepository } from './local/local-moment-repository';
import { LocalPhotoStorage } from './local/local-photo-storage';

export type Services = {
  mode: 'cloud' | 'demo';
  photoProvider: 'cloudinary' | 'firebase' | 'local';
  auth: AuthGateway;
  moments: MomentRepository;
  photos: PhotoStorage;
  compressor: PhotoCompressor;
  store: KeyValueStore;
  directory: CampusDirectory;
  reminders: ReminderScheduler;
};

/**
 * Raíz de composición (Factory): el único lugar que conoce las implementaciones concretas.
 * El resto de la app depende solo de los puertos del dominio.
 */
export const createServices = (config: Env = env): Services => {
  const store = new AsyncStorageStore();
  const shared = {
    store,
    compressor: new ExpoPhotoCompressor(),
    directory: new LocalCampusDirectory(),
    reminders: new ExpoReminderScheduler(),
  };

  if (!hasFirebase(config)) {
    return {
      ...shared,
      mode: 'demo',
      photoProvider: 'local',
      auth: new LocalAuthGateway(store),
      moments: new LocalMomentRepository(store, demoMoments),
      photos: new LocalPhotoStorage(),
    };
  }

  const firebase = getFirebase(config.firebase);
  const useCloudinary = hasCloudinary(config);
  return {
    ...shared,
    mode: 'cloud',
    photoProvider: useCloudinary ? 'cloudinary' : 'firebase',
    auth: new FirebaseAuthGateway(firebase.auth, firebase.db),
    moments: new FirestoreMomentRepository(firebase.db),
    photos: useCloudinary ? new CloudinaryPhotoStorage(config.cloudinary) : new FirebasePhotoStorage(firebase.storage),
  };
};

export const services = createServices();
