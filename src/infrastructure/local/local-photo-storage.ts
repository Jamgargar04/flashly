import type { PhotoStorage } from '@/domain/ports';

/** En modo demostración la foto se queda en el teléfono: la "URL" es la ruta local. */
export class LocalPhotoStorage implements PhotoStorage {
  async upload(localUri: string): Promise<string> {
    return localUri;
  }
}
