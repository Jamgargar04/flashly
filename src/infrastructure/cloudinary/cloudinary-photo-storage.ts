import { DomainError } from '@/domain/domain-error';
import type { PhotoStorage, PhotoTarget } from '@/domain/ports';

export type CloudinaryConfig = { cloudName: string; uploadPreset: string };
type CloudinaryResponse = { secure_url?: string; error?: { message?: string } };

/**
 * API de terceros: sube fotos a Cloudinary con un "upload preset" sin firma.
 * Las restricciones (formato, tamaño, carpeta) se configuran en el preset desde el panel de Cloudinary.
 */
export class CloudinaryPhotoStorage implements PhotoStorage {
  constructor(private readonly config: CloudinaryConfig, private readonly http: typeof fetch = fetch) {}

  get endpoint(): string {
    return `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`;
  }

  async upload(localUri: string, target: PhotoTarget): Promise<string> {
    const form = new FormData();
    // En React Native un archivo local se envía como { uri, type, name }.
    form.append('file', { uri: localUri, type: 'image/jpeg', name: `${target.name}.jpg` } as unknown as Blob);
    form.append('upload_preset', this.config.uploadPreset);
    form.append('folder', target.folder);

    let response: Response;
    try {
      response = await this.http(this.endpoint, { method: 'POST', body: form });
    } catch {
      throw new DomainError('Sin conexión. No se pudo subir la foto.', 'upload-network');
    }
    const body = (await response.json().catch(() => ({}))) as CloudinaryResponse;
    if (!response.ok) throw new DomainError(body.error?.message ?? 'Cloudinary rechazó la foto.', 'upload-rejected');
    if (!body.secure_url) throw new DomainError('Cloudinary no devolvió la dirección de la foto.', 'upload-invalid');
    return body.secure_url;
  }
}
