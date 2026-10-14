import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { RefreshCcw, X, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Txt } from '@/components/ui';
import { brand, radius, space, type } from '@/constants/theme';
import { useSession } from '@/application/session-store';
import { useFlashWindow } from '@/application/use-flash-window';
import { usePublishMoment } from '@/application/use-publish-moment';
import { mmss } from '@/components/time-format';
import { messageOf } from '@/domain/domain-error';

type Stage = 'back' | 'front' | 'review' | 'publishing';

export default function Capture() {
  const insets = useSafeAreaInsets();
  const student = useSession((s) => s.student);
  const publishMoment = usePublishMoment();
  const { window, phase, remaining } = useFlashWindow();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [stage, setStage] = useState<Stage>('back');
  const [back, setBack] = useState<string | null>(null);
  const [front, setFront] = useState<string | null>(null);
  const [swapped, setSwapped] = useState(false);
  const [caption, setCaption] = useState('');

  // Segunda foto automática con la cámara frontal.
  useEffect(() => {
    if (stage !== 'front') return;
    const id = setTimeout(async () => {
      try {
        const shot = await camera.current?.takePictureAsync({ quality: 0.8 });
        if (shot?.uri) {
          setFront(shot.uri);
          setStage('review');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        }
      } catch {
        setStage('back');
      }
    }, 1100);
    return () => clearTimeout(id);
  }, [stage]);

  const shoot = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    try {
      const shot = await camera.current?.takePictureAsync({ quality: 0.8 });
      if (shot?.uri) {
        setBack(shot.uri);
        setStage('front');
      }
    } catch {
      Alert.alert('No se pudo tomar la foto', 'Intenta de nuevo.');
    }
  };

  const retake = () => {
    setBack(null);
    setFront(null);
    setSwapped(false);
    setStage('back');
  };

  const send = async () => {
    if (!student || !back || !front) return;
    setStage('publishing');
    try {
      await publishMoment({ author: student, day: window.id, phase, backUri: back, frontUri: front, caption });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      router.back();
    } catch (e) {
      setStage('review');
      Alert.alert('No se pudo publicar', messageOf(e, 'Revisa tu conexión e intenta de nuevo.'));
    }
  };

  const close = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.round}>
      <X size={22} color="#FFFFFF" />
    </Pressable>
  );

  if (phase === 'waiting') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <View style={[styles.topBar, { top: insets.top + space.sm }]}>{close}</View>
        <Txt variant="title2" color="#FFFFFF" center>
          La ventana aún no se abre
        </Txt>
        <Txt variant="subhead" color="rgba(255,255,255,0.6)" center style={{ marginTop: space.sm }}>
          Te avisaremos cuando sea el momento.
        </Txt>
      </View>
    );
  }

  if (!permission) return <View style={styles.center} />;
  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingHorizontal: space.xxl }]}>
        <View style={[styles.topBar, { top: insets.top + space.sm }]}>{close}</View>
        <Txt variant="title2" color="#FFFFFF" center>
          Flashly necesita tu cámara
        </Txt>
        <Txt variant="subhead" color="rgba(255,255,255,0.6)" center style={{ marginVertical: space.lg }}>
          Se usa la cámara trasera y la frontal para mostrar lo que haces y quién lo hace.
        </Txt>
        <Button title="Permitir cámara" onPress={requestPermission} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  const reviewing = stage === 'review' || stage === 'publishing';
  const main = swapped ? front : back;
  const inset = swapped ? back : front;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#000000' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.frame, { marginTop: insets.top + 60 }]}>
        {reviewing && main ? (
          <Animated.View entering={FadeIn.duration(280)} style={StyleSheet.absoluteFill}>
            <Image source={{ uri: main }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.inset}>
              <Pressable onPress={() => setSwapped((s) => !s)} style={StyleSheet.absoluteFill} accessibilityLabel="Intercambiar fotos">
                {inset ? <Image source={{ uri: inset }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}
              </Pressable>
            </Animated.View>
          </Animated.View>
        ) : (
          <>
            <CameraView ref={camera} style={StyleSheet.absoluteFill} facing={stage === 'front' ? 'front' : 'back'} mirror={stage === 'front'} animateShutter />
            {back && stage === 'front' ? (
              <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.inset}>
                <Image source={{ uri: back }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </Animated.View>
            ) : null}
            {stage === 'front' ? (
              <Animated.View entering={FadeIn.duration(200)} style={styles.hint}>
                <Txt variant="headline" color="#FFFFFF">
                  Ahora tú. Sonríe.
                </Txt>
              </Animated.View>
            ) : null}
          </>
        )}
      </View>

      <View style={[styles.topBar, { top: insets.top + space.sm }]}>
        {close}
        <View style={[styles.pill, { backgroundColor: phase === 'open' ? brand.flash : 'rgba(255,255,255,0.18)' }]}>
          {phase === 'open' ? <Zap size={16} color={brand.flashInk} fill={brand.flashInk} /> : null}
          <Txt variant="headline" color={phase === 'open' ? brand.flashInk : '#FFFFFF'}>
            {phase === 'open' ? mmss(remaining) : 'Publicación tarde'}
          </Txt>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        {reviewing ? (
          <>
            <TextInput
              value={caption}
              onChangeText={(t) => setCaption(t.slice(0, 80))}
              placeholder="Escribe algo (opcional)"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={[type.body, styles.caption]}
              maxLength={80}
            />
            <View style={styles.actions}>
              <Button title="Repetir" variant="secondary" onPress={retake} disabled={stage === 'publishing'} style={{ flex: 1 }} />
              <Button title="Publicar" variant="flash" onPress={send} loading={stage === 'publishing'} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <View style={styles.shutterRow}>
            <View style={{ width: 52 }} />
            <Pressable
              onPress={shoot}
              disabled={stage !== 'back'}
              accessibilityRole="button"
              accessibilityLabel="Tomar foto"
              style={({ pressed }) => [styles.shutter, { transform: [{ scale: pressed ? 0.92 : 1 }], opacity: stage === 'back' ? 1 : 0.5 }]}>
              <View style={styles.shutterInner} />
            </Pressable>
            <View style={[styles.round, { width: 52, height: 52, borderRadius: 26 }]}>
              <RefreshCcw size={22} color="rgba(255,255,255,0.6)" />
            </View>
          </View>
        )}
        <Txt variant="footnote" color="rgba(255,255,255,0.55)" center>
          {reviewing ? 'Toca la foto pequeña para intercambiarlas.' : 'Se toman las dos cámaras, una tras otra.'}
        </Txt>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  frame: { marginHorizontal: space.md, aspectRatio: 4 / 5, borderRadius: radius.xl, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: '#14121F' },
  inset: {
    position: 'absolute', top: space.md, left: space.md, width: '30%', aspectRatio: 3 / 4,
    borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#000',
  },
  hint: { position: 'absolute', bottom: space.lg, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.pill },
  topBar: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, height: 36, borderRadius: radius.pill },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: space.xl, gap: space.lg },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  shutter: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: brand.flash, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FFFFFF' },
  caption: { color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, paddingHorizontal: space.lg, height: 52 },
  actions: { flexDirection: 'row', gap: space.md },
});
