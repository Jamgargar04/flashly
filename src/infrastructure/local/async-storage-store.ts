import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValueStore } from '@/domain/ports';

/** Almacenamiento clave-valor en el teléfono (JSON sobre AsyncStorage). */
export class AsyncStorageStore implements KeyValueStore {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
