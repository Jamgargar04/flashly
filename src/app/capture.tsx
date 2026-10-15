import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SwitchCamera, X, Zap, ZapOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PublishStep } from '@/application/publish-moment';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useFlashWindow } from '@/application/use-flash-window';
import { useLang } from '@/application/use-lang';
import { usePublishMoment } from '@/application/use-publishing';
import { ReviewPanel } from '@/components/capture/review-panel';
import { useErrorText } from '@/components/localize-error';
import { mmss } from '@/components/time-format';
import { Button, IconButton, Txt } from '@/components/ui';
import { brand, radius, space } from '@/constants/theme';
import type { CampusPlace } from '@/domain/place';

type Facing = 'back' | 'front';
type Stage = 'first' | 'second' | 'review';

const other = (facing: Facing): Facing => (facing === 'back' ? 'front' : 'back');

/** Permiso de cámara: si ya se negó para siempre, lleva directo a los ajustes del teléfono. */
const PermissionGate = ({ canAskAgain, onRequest }: { canAskAgain: boolean; onRequest: () => void }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  return (
    <View style={[styles.center, { paddingHorizontal: space.xxl }]}>
      <StatusBar style="light" />
      <View style={[styles.topBar, { top: insets.top + space.sm }]}>
        <IconButton icon={<X size={22} color="#FFFFFF" />} label={t.common.close} variant="glass" onPress={() => router.back()} />
      </View>
      <Txt variant="title2" color="#FFFFFF" center>
        {t.capture.needCameraTitle}
      </Txt>
      <Txt variant="subhead" color="rgba(255,255,255,0.6)" center style={{ marginVertical: space.lg }}>
        {t.capture.needCameraBody}
      </Txt>
      <Button
        title={canAskAgain ? t.capture.allowCamera : t.common.openSettings}
        onPress={canAskAgain ? onRequest : () => Linking.openSettings().catch(() => undefined)}
        style={{ alignSelf: 'stretch' }}
      />
    </View>
  );
};

export default function Capture() {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const errorText = useErrorText();
  const student = useSession((s) => s.student);
  const publishMoment = usePublishMoment();
  const { window, phase, remaining } = useFlashWindow();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [stage, setStage] = useState<Stage>('first');
  const [firstFacing, setFirstFacing] = useState<Facing>('back');
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState<Partial<Record<Facing, string>>>({});
  const [swapped, setSwapped] = useState(false);
  const [caption, setCaption] = useState('');
  const [place, setPlace] = useState<CampusPlace | null>(null);
  const [step, setStep] = useState<PublishStep | null>(null);
  const facing = stage === 'second' ? other(firstFacing) : firstFacing;

  // La segunda foto se toma sola con la otra cámara.
  useEffect(() => {
    if (stage !== 'second') return;
    const id = setTimeout(async () => {
      try {
        const shot = await camera.current?.takePictureAsync({ quality: 0.8 });
        if (!shot?.uri) throw new Error('no-photo');
        setPhotos((current) => ({ ...current, [facing]: shot.uri }));
        setStage('review');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      } catch {
        toast.error(t.capture.shotError);
        setPhotos({});
        setStage('first');
      }
    }, 1100);
    return () => clearTimeout(id);
  }, [stage, facing, t]);

  if (!permission) return <View style={styles.center} />;
  if (!permission.granted) return <PermissionGate canAskAgain={permission.canAskAgain} onRequest={requestPermission} />;

  const shoot = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    try {
      const shot = await camera.current?.takePictureAsync({ quality: 0.8 });
      if (!shot?.uri) return;
      setPhotos({ [firstFacing]: shot.uri });
      setStage('second');
    } catch {
      toast.error(t.capture.shotError);
    }
  };

  const retake = () => {
    setPhotos({});
    setSwapped(false);
    setStage('first');
  };

  const publish = async () => {
    if (!student || !photos.back || !photos.front) return;
    setStep('compress');
    try {
      await publishMoment(
        { author: student, day: window.id, phase, backUri: photos.back, frontUri: photos.front, caption, location: place ?? undefined },
        setStep,
      );
      toast.success(t.capture.published);
      router.back();
    } catch (error) {
      setStep(null);
      toast.error(errorText(error));
    }
  };

  const reviewing = stage === 'review';
  const main = swapped ? photos.front : photos.back;
  const inset = swapped ? photos.back : photos.front;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <StatusBar style="light" />
      <View style={[styles.frame, { marginTop: insets.top + 60 }]}>
        {reviewing && main ? (
          <Animated.View entering={FadeIn.duration(280)} style={StyleSheet.absoluteFill}>
            <Image source={{ uri: main }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.inset}>
              <Pressable onPress={() => setSwapped((s) => !s)} style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={t.moment.swap}>
                {inset ? <Image source={{ uri: inset }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}
              </Pressable>
            </Animated.View>
          </Animated.View>
        ) : (
          <>
            <CameraView ref={camera} style={StyleSheet.absoluteFill} facing={facing} mirror={facing === 'front'} flash={flash ? 'on' : 'off'} animateShutter />
            {stage === 'second' && photos[firstFacing] ? (
              <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.inset}>
                <Image source={{ uri: photos[firstFacing] }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </Animated.View>
            ) : null}
            {stage === 'second' ? (
              <Animated.View entering={FadeIn.duration(200)} style={styles.hint}>
                <Txt variant="headline" color="#FFFFFF">
                  {t.capture.secondShot}
                </Txt>
              </Animated.View>
            ) : null}
          </>
        )}
      </View>

      <View style={[styles.topBar, { top: insets.top + space.sm }]}>
        <IconButton icon={<X size={22} color="#FFFFFF" />} label={t.common.close} variant="glass" onPress={() => router.back()} disabled={step !== null} />
        {phase !== 'waiting' ? (
          <View style={[styles.pill, { backgroundColor: phase === 'open' ? brand.flash : 'rgba(255,255,255,0.18)' }]}>
            {phase === 'open' ? <Zap size={16} color={brand.flashInk} fill={brand.flashInk} /> : null}
            <Txt variant="headline" color={phase === 'open' ? brand.flashInk : '#FFFFFF'} style={{ fontVariant: ['tabular-nums'] }}>
              {phase === 'open' ? mmss(remaining) : t.capture.late}
            </Txt>
          </View>
        ) : null}
        <IconButton
          icon={flash ? <Zap size={20} color={brand.flash} fill={brand.flash} /> : <ZapOff size={20} color="#FFFFFF" />}
          label={flash ? t.capture.flashOn : t.capture.flashOff}
          variant="glass"
          onPress={() => setFlash((value) => !value)}
          disabled={reviewing}
        />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        {reviewing ? (
          <ReviewPanel caption={caption} onCaption={setCaption} place={place} onPlace={setPlace} step={step} onRetake={retake} onPublish={publish} />
        ) : (
          <View style={styles.shutterRow}>
            <View style={{ width: 52 }} />
            <Pressable
              onPress={shoot}
              disabled={stage !== 'first'}
              accessibilityRole="button"
              accessibilityLabel={t.capture.shutter}
              style={({ pressed }) => [styles.shutter, { transform: [{ scale: pressed ? 0.92 : 1 }], opacity: stage === 'first' ? 1 : 0.5 }]}>
              <View style={styles.shutterInner} />
            </Pressable>
            <IconButton
              icon={<SwitchCamera size={22} color="#FFFFFF" />}
              label={t.capture.flip}
              variant="glass"
              size={52}
              disabled={stage !== 'first'}
              onPress={() => setFirstFacing(other)}
            />
          </View>
        )}
        <Txt variant="footnote" color="rgba(255,255,255,0.55)" center>
          {reviewing ? t.capture.hintReview : t.capture.hintCapture}
        </Txt>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  frame: { marginHorizontal: space.md, aspectRatio: 4 / 5, borderRadius: radius.xl, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: '#14121F' },
  inset: {
    position: 'absolute', top: space.md, left: space.md, width: '30%', aspectRatio: 3 / 4,
    borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#000000',
  },
  hint: { position: 'absolute', bottom: space.lg, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.pill },
  topBar: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, height: 36, borderRadius: radius.pill },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: space.xl, gap: space.lg },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  shutter: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: brand.flash, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FFFFFF' },
});
