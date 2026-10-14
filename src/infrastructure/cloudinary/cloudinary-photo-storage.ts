import { DomainError } from '@/domain/domain-error';
import type { PhotoStorage, PhotoTarget } from '@/domain/ports';

export type CloudinaryConfig = { cloudName: string; uploadPreset: string };
type CloudinaryResponse = { secure_url?: string; error?: { message?: string } };

/**
 * API de terceros: sube fotos a Cloudinary con un "upload preset" sin firma.
 * Usa FileSystem.uploadAsync (nativo) para evitar problemas con URIs locales en Android.
 * En tests se puede inyectar un http alternativo para no depender de la red.
 */
export class CloudinaryPhotoStorage implements PhotoStorage {
  constructor(private readonly config: CloudinaryConfig, private readonly http?: typeof fetch) {}

  get endpoint(): string {
    return `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`;
  }

  async upload(localUri: string, target: PhotoTarget): Promise<string> {
    return this.http
      ? this.uploadWithFetch(localUri, target)
      : this.uploadWithFileSystem(localUri, target);
  }

  private uploadWithFileSystem(localUri: string, target: PhotoTarget): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.endpoint);
      xhr.timeout = 60000;
      xhr.onload = () => {
        let body: CloudinaryResponse;
        try { body = JSON.parse(xhr.responseText) as CloudinaryResponse; } catch { body = {}; }
        if (xhr.status >= 400)
          return reject(new DomainError(body.error?.message ?? 'Cloudinary rechazó la foto.', 'upload-rejected'));
        if (!body.secure_url)
          return reject(new DomainError('Cloudinary no devolvió la dirección de la foto.', 'upload-invalid'));
        resolve(body.secure_url);
      };
      xhr.onerror = () => reject(new DomainError('Sin conexión al subir la foto (XHR).', 'upload-network'));
      xhr.ontimeout = () => reject(new DomainError('Tiempo agotado al subir la foto.', 'upload-timeout'));

      const form = new FormData();
      form.append('file', { uri: localUri, type: 'image/jpeg', name: `${target.name}.jpg` } as unknown as Blob);
      form.append('upload_preset', this.config.uploadPreset);
      form.append('folder', target.folder);
      xhr.send(form);
    });
  }

  private async uploadWithFetch(localUri: string, target: PhotoTarget): Promise<string> {
    const form = new FormData();
    form.append('file', { uri: localUri, type: 'image/jpeg', name: `${target.name}.jpg` } as unknown as Blob);
    form.append('upload_preset', this.config.uploadPreset);
    form.append('folder', target.folder);

    let response: Response;
    try {
      response = await this.http!(this.endpoint, { method: 'POST', body: form });
    } catch {
      throw new DomainError('Sin conexión. No se pudo subir la foto.', 'upload-network');
    }
    const body = (await response.json().catch(() => ({}))) as CloudinaryResponse;
    if (!response.ok) throw new DomainError(body.error?.message ?? 'Cloudinary rechazó la foto.', 'upload-rejected');
    if (!body.secure_url) throw new DomainError('Cloudinary no devolvió la dirección de la foto.', 'upload-invalid');
    return body.secure_url;
  }
}
