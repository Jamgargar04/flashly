import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gradient, radius, space, usePalette } from '@/constants/theme';

import { Button, Card, Txt } from './ui';

const PREVIEW = [require('@/assets/demo/back1.png'), require('@/assets/demo/back3.png')];

/** "Si no publicas, no ves": vista previa desenfocada del feed. */
export function LockedFeed({ canPost, onPost }: { canPost: boolean; onPost: () => void }) {
  const c = usePalette();
  return (
    <View>
      <View style={{ gap: space.md }}>
        {PREVIEW.map((src, i) => (
          <Card key={i} padded={false} style={{ overflow: 'hidden' }}>
            <View style={styles.media}>
              <Image source={src} blurRadius={45} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: c.scheme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.18)' }]} />
            </View>
          </Card>
        ))}
      </View>
      <View style={styles.overlay} pointerEvents="box-none">
        <Card style={styles.lockCard}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lockIcon}>
            <Lock size={26} color="#FFFFFF" strokeWidth={2.2} />
          </LinearGradient>
          <Txt variant="title3" center>
            Publica para ver
          </Txt>
          <Txt variant="subhead" color={c.secondary} center>
            Los momentos de hoy se desbloquean cuando compartes el tuyo.
          </Txt>
          {canPost ? <Button title="Tomar mi foto" variant="primary" onPress={onPost} style={{ alignSelf: 'stretch', marginTop: space.sm }} /> : null}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  media: { width: '100%', aspectRatio: 4 / 5 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: 90, paddingHorizontal: space.xl },
  lockCard: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl, width: '100%', borderRadius: radius.xl },
  lockIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
});
