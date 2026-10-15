import type { PhotoCompressor, PhotoStorage, ProfileUpdate } from '@/domain/ports';

export const AVATAR_WIDTH = 480;

export type ChangeAvatarDeps = {
  compressor: PhotoCompressor;
  photos: PhotoStorage;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
};

/** Caso de uso "Cambiar foto de perfil": comprime, sube y guarda la nueva URL en el perfil. */
export const createChangeAvatar = ({ compressor, photos, updateProfile }: ChangeAvatarDeps) =>
  async (uid: string, localUri: string): Promise<string> => {
    const compressed = await compressor.compress(localUri, AVATAR_WIDTH);
    const photoUrl = await photos.upload(compressed, { folder: `flashly/avatars/${uid}`, name: `avatar-${Date.now()}` });
    await updateProfile({ photoUrl });
    return photoUrl;
  };
