import { launchImageLibraryAsync } from 'expo-image-picker';

import type { ImagePicker } from '@/domain/ports';

/** Galería del teléfono con recorte integrado (selector de fotos del sistema, sin permisos extra). */
export class ExpoImagePicker implements ImagePicker {
  async pickImage({ aspect, circular }: { aspect: [number, number]; circular?: boolean }): Promise<string | null> {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      shape: circular ? 'oval' : 'rectangle',
      quality: 0.9,
    });
    if (result.canceled) return null;
    return result.assets[0]?.uri ?? null;
  }
}
