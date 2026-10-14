import { getDownloadURL, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage';

import type { PhotoStorage, PhotoTarget } from '@/domain/ports';

const toBlob = (uri: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('No se pudo leer la foto.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

/** Alternativa a Cloudinary: Cloud Storage for Firebase (requiere el plan Blaze). */
export class FirebasePhotoStorage implements PhotoStorage {
  constructor(private readonly storage: FirebaseStorage) {}

  async upload(localUri: string, target: PhotoTarget): Promise<string> {
    const reference = ref(this.storage, `${target.folder}/${target.name}.jpg`);
    await uploadBytes(reference, await toBlob(localUri), { contentType: 'image/jpeg' });
    return getDownloadURL(reference);
  }
}
