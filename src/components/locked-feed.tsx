import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { gradient, radius, space, usePalette } from '@/constants/theme';

import { Button, Card, Txt } from './ui';

const PREVIEW = [require('@/assets/demo/back1.png'), require('@/assets/demo/back3.png')];

/** "Si no publicas, no ves": vista previa desenfocada del feed con la invitación a publicar. */
export const LockedFeed = ({ onPost }: { onPost?: () => void }) => {
  const c = usePalette();
  const { t } = useLang();
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={{ gap: space.md }}>
        {PREVIEW.map((src, i) => (
          <Card key={i} padded={false} style={styles.preview}>
            <Image source={src} blurRadius={45} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: c.scheme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.18)' }]} />
          </Card>
        ))}
      </View>
      <View style={styles.overlay} pointerEvents="box-none">
        <Card style={styles.lockCard}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lockIcon}>
            <Lock size={26} color="#FFFFFF" strokeWidth={2.2} />
          </LinearGradient>
          <Txt variant="title3" center>
            {t.today.lockedTitle}
          </Txt>
          <Txt variant="subhead" color={c.secondary} center>
            {t.today.lockedBody}
          </Txt>
          {onPost ? (
            <Button title={t.hero.takePhoto} icon={<Camera size={20} color="#FFFFFF" />} onPress={onPost} style={styles.cta} />
          ) : null}
        </Card>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  preview: { overflow: 'hidden', aspectRatio: 4 / 5 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: 90, paddingHorizontal: space.xl },
  lockCard: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl, width: '100%', borderRadius: radius.xl },
  lockIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  cta: { alignSelf: 'stretch', marginTop: space.sm },
});
