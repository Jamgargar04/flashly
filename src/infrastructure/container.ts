import type {
  AuthGateway, CampusDirectory, ChatRepository, EventRepository, ImagePicker, KeyValueStore, MomentRepository,
  PhotoCompressor, PhotoStorage, ReminderScheduler, ReportRepository, SocialGraph,
} from '@/domain/ports';

import { CloudinaryPhotoStorage } from './cloudinary/cloudinary-photo-storage';
import { ExpoImagePicker } from './device/expo-image-picker';
import { ExpoPhotoCompressor } from './device/expo-photo-compressor';
import { ExpoReminderScheduler } from './device/expo-reminder-scheduler';
import { env, hasCloudinary, hasFirebase, type Env } from './env';
import { getFirebase } from './firebase/firebase-app';
import { FirebaseAuthGateway } from './firebase/firebase-auth-gateway';
import { FirebasePhotoStorage } from './firebase/firebase-photo-storage';
import { FirestoreCampusDirectory } from './firebase/firestore-campus-directory';
import { FirestoreChatRepository } from './firebase/firestore-chat-repository';
import { FirestoreEventRepository } from './firebase/firestore-event-repository';
import { FirestoreMomentRepository } from './firebase/firestore-moment-repository';
import { FirestoreReportRepository } from './firebase/firestore-report-repository';
import { FirestoreSocialGraph } from './firebase/firestore-social-graph';
import { AsyncStorageStore } from './local/async-storage-store';
import { demoMoments } from './local/demo-content';
import { LocalAuthGateway } from './local/local-auth-gateway';
import { LocalCampusDirectory } from './local/local-campus-directory';
import { LocalChatRepository } from './local/local-chat-repository';
import { LocalEventRepository } from './local/local-event-repository';
import { LocalMomentRepository } from './local/local-moment-repository';
import { LocalPhotoStorage } from './local/local-photo-storage';
import { LocalReportRepository } from './local/local-report-repository';
import { LocalSocialGraph } from './local/local-social-graph';

export type Services = {
  mode: 'cloud' | 'demo';
  photoProvider: 'cloudinary' | 'firebase' | 'local';
  auth: AuthGateway;
  moments: MomentRepository;
  photos: PhotoStorage;
  compressor: PhotoCompressor;
  picker: ImagePicker;
  store: KeyValueStore;
  directory: CampusDirectory;
  social: SocialGraph;
  events: EventRepository;
  chat: ChatRepository;
  reports: ReportRepository;
  reminders: ReminderScheduler;
};

/**
 * Raíz de composición (Factory): el único lugar que conoce las implementaciones concretas.
 * El resto de la app depende solo de los puertos del dominio.
 */
export const createServices = (config: Env = env): Services => {
  const store = new AsyncStorageStore();
  const device = {
    store,
    compressor: new ExpoPhotoCompressor(),
    picker: new ExpoImagePicker(),
    reminders: new ExpoReminderScheduler(),
  };

  if (!hasFirebase(config)) {
    return {
      ...device,
      mode: 'demo',
      photoProvider: 'local',
      auth: new LocalAuthGateway(store),
      moments: new LocalMomentRepository(store, demoMoments),
      photos: new LocalPhotoStorage(),
      directory: new LocalCampusDirectory(),
      social: new LocalSocialGraph(store),
      events: new LocalEventRepository(),
      chat: new LocalChatRepository(),
      reports: new LocalReportRepository(),
    };
  }

  const firebase = getFirebase(config.firebase);
  const useCloudinary = hasCloudinary(config);
  return {
    ...device,
    mode: 'cloud',
    photoProvider: useCloudinary ? 'cloudinary' : 'firebase',
    auth: new FirebaseAuthGateway(firebase.auth, firebase.db),
    moments: new FirestoreMomentRepository(firebase.db),
    photos: useCloudinary ? new CloudinaryPhotoStorage(config.cloudinary) : new FirebasePhotoStorage(firebase.storage),
    directory: new FirestoreCampusDirectory(firebase.db),
    social: new FirestoreSocialGraph(firebase.db),
    events: new FirestoreEventRepository(firebase.db),
    chat: new FirestoreChatRepository(firebase.db),
    reports: new FirestoreReportRepository(firebase.db),
  };
};

export const services = createServices();
