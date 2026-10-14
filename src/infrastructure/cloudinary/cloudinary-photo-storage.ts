import * as FileSystem from 'expo-file-system';

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

  private async uploadWithFileSystem(localUri: string, target: PhotoTarget): Promise<string> {
    let result: FileSystem.FileSystemUploadResult;
    try {
      result = await FileSystem.uploadAsync(this.endpoint, localUri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: 'image/jpeg',
        parameters: {
          upload_preset: this.config.uploadPreset,
          folder: target.folder,
          public_id: target.name,
        },
      });
    } catch {
      throw new DomainError('Sin conexión. No se pudo subir la foto.', 'upload-network');
    }
    let body: CloudinaryResponse;
    try { body = JSON.parse(result.body) as CloudinaryResponse; } catch { body = {}; }
    if (result.status < 200 || result.status >= 300)
      throw new DomainError(body.error?.message ?? 'Cloudinary rechazó la foto.', 'upload-rejected');
    if (!body.secure_url)
      throw new DomainError('Cloudinary no devolvió la dirección de la foto.', 'upload-invalid');
    return body.secure_url;
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
