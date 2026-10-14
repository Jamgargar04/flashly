import type { KeyValueStore } from '@/domain/ports';

/** Doble de prueba: almacenamiento en memoria con la misma interfaz que AsyncStorage. */
export class InMemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();

  async get<T>(key: string, fallback: T): Promise<T> {
    const raw = this.data.get(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.data.set(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.data.delete(key);
  }
}
