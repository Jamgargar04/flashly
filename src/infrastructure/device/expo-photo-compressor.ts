import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { PhotoCompressor } from '@/domain/ports';

/** Reduce y comprime la foto antes de subirla para ahorrar datos y almacenamiento. */
export class ExpoPhotoCompressor implements PhotoCompressor {
  async compress(localUri: string, maxWidth: number): Promise<string> {
    const image = await ImageManipulator.manipulate(localUri).resize({ width: maxWidth }).renderAsync();
    const result = await image.saveAsync({ compress: 0.72, format: SaveFormat.JPEG });
    return result.uri;
  }
}
