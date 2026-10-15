import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import type { PhotoSource } from '@/domain/moment';
import { font, gradient, usePalette } from '@/constants/theme';

type AvatarProps = {
  name: string;
  /** Foto de perfil en la nube. */
  uri?: string;
  /** Foto empaquetada (modo demostración). */
  source?: PhotoSource;
  size?: number;
  /** Anillo con el degradado de la marca (por ejemplo, tu propio perfil). */
  ring?: boolean;
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || '?';

export const Avatar = ({ name, uri, source, size = 40, ring }: AvatarProps) => {
  const c = usePalette();
  const image = uri ? { uri } : source;
  const circle = { width: size, height: size, borderRadius: size / 2 };

  const content = image ? (
    <Image source={image} style={circle} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
  ) : (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[circle, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: '#FFFFFF', fontFamily: font.semibold, fontSize: size * 0.38, lineHeight: size * 0.46 }}>{initialsOf(name)}</Text>
    </LinearGradient>
  );

  if (!ring) return content;
  const ringWidth = Math.max(2, size * 0.04);
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: ringWidth, borderRadius: size }}>
      <View style={{ padding: ringWidth, borderRadius: size, backgroundColor: c.card }}>{content}</View>
    </LinearGradient>
  );
};
