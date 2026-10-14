import { DomainError } from '@/domain/domain-error';
import { CloudinaryPhotoStorage } from '@/infrastructure/cloudinary/cloudinary-photo-storage';

class FakeFormData {
  readonly parts: [string, unknown][] = [];
  append(key: string, value: unknown) {
    this.parts.push([key, value]);
  }
}

const reply = (ok: boolean, body: unknown) => ({ ok, json: async () => body }) as unknown as Response;
const config = { cloudName: 'demo-cloud', uploadPreset: 'flashly_unsigned' };
const target = { folder: 'flashly/2026-10-13/u1', name: 'back' as const };

beforeAll(() => {
  (globalThis as unknown as { FormData: unknown }).FormData = FakeFormData;
});

describe('API de terceros: Cloudinary', () => {
  it('envía el preset y la carpeta y devuelve la URL segura', async () => {
    const http = jest.fn<Promise<Response>, [string, RequestInit]>(async () => reply(true, { secure_url: 'https://res.cloudinary.com/x/back.jpg' }));
    const storage = new CloudinaryPhotoStorage(config, http as unknown as typeof fetch);

    await expect(storage.upload('file://back.jpg', target)).resolves.toBe('https://res.cloudinary.com/x/back.jpg');

    const [endpoint, init] = http.mock.calls[0];
    const fields = Object.fromEntries((init.body as unknown as FakeFormData).parts);
    expect(endpoint).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(init.method).toBe('POST');
    expect(fields.upload_preset).toBe('flashly_unsigned');
    expect(fields.folder).toBe('flashly/2026-10-13/u1');
    expect(fields.file).toEqual({ uri: 'file://back.jpg', type: 'image/jpeg', name: 'back.jpg' });
  });

  it('traduce un error de red a un mensaje claro', async () => {
    const http = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });
    const storage = new CloudinaryPhotoStorage(config, http as unknown as typeof fetch);
    await expect(storage.upload('file://back.jpg', target)).rejects.toThrow('Sin conexión');
  });

  it('muestra el motivo cuando Cloudinary rechaza la foto', async () => {
    const http = jest.fn(async () => reply(false, { error: { message: 'Upload preset not found' } }));
    const storage = new CloudinaryPhotoStorage(config, http as unknown as typeof fetch);
    await expect(storage.upload('file://back.jpg', target)).rejects.toThrow('Upload preset not found');
  });

  it('falla si la respuesta no trae la URL', async () => {
    const http = jest.fn(async () => reply(true, {}));
    const storage = new CloudinaryPhotoStorage(config, http as unknown as typeof fetch);
    await expect(storage.upload('file://back.jpg', target)).rejects.toBeInstanceOf(DomainError);
  });
});
