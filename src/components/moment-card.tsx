import { Image } from 'expo-image';
import { Ellipsis, Heart, MapPin } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { brand, elevation, motion, radius, space, usePalette } from '@/constants/theme';
import type { Moment } from '@/domain/moment';
import { isCampusPlace } from '@/domain/place';

import { timeAgo } from './time-format';
import { Avatar, Chip, IconButton, playHaptic, PressableScale, Txt } from './ui';

type MomentCardProps = {
  moment: Moment;
  uid: string;
  /** Hora actual compartida por toda la lista (un solo reloj, no uno por tarjeta). */
  now: number;
  onLike: (moment: Moment) => void;
  onMore?: (moment: Moment) => void;
  onAuthorPress?: (moment: Moment) => void;
};

const MomentHeader = ({ moment, uid, now, onMore, onAuthorPress }: Omit<MomentCardProps, 'onLike'>) => {
  const c = usePalette();
  const { t } = useLang();
  const meta = [moment.authorGroup, timeAgo(t.time, moment.createdAt, now)].filter(Boolean).join(' · ');
  return (
    <View style={styles.head}>
      <Pressable
        style={styles.author}
        disabled={!onAuthorPress}
        onPress={() => onAuthorPress?.(moment)}
        accessibilityRole="button"
        accessibilityLabel={`${t.moment.viewProfile}: ${moment.authorName}`}>
        <Avatar name={moment.authorName} source={moment.avatar} size={38} />
        <View style={{ flex: 1 }}>
          <Txt variant="headline" numberOfLines={1}>
            {moment.authorId === uid ? `${moment.authorName} · ${t.common.you}` : moment.authorName}
          </Txt>
          <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
            {meta}
          </Txt>
        </View>
      </Pressable>
      {moment.late ? <Chip label={t.moment.late} color="rgba(255,197,61,0.22)" textColor={c.scheme === 'dark' ? brand.flash : '#8A6100'} /> : null}
      {onMore ? (
        <IconButton icon={<Ellipsis size={20} color={c.secondary} />} label={t.moment.more} variant="plain" size={32} onPress={() => onMore(moment)} />
      ) : null}
    </View>
  );
};

/** Foto trasera con la frontal encima; tocar la pequeña las intercambia (con fundido). */
const MomentMedia = ({ moment, burst, onDoubleTap }: { moment: Moment; burst: SharedValue<number>; onDoubleTap: () => void }) => {
  const c = usePalette();
  const { t } = useLang();
  const [swapped, setSwapped] = useState(false);
  const place = moment.location && isCampusPlace(moment.location) ? t.places[moment.location] : moment.location;
  const doubleTap = Gesture.Tap().numberOfTaps(2).maxDelay(260).runOnJS(true).onEnd(onDoubleTap);
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.4, 1]) }],
  }));

  return (
    <GestureDetector gesture={doubleTap}>
      <View style={[styles.media, { backgroundColor: c.media }]}>
        <Image source={swapped ? moment.front : moment.back} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        <Pressable
          onPress={() => {
            playHaptic('selection');
            setSwapped((value) => !value);
          }}
          accessibilityRole="button"
          accessibilityLabel={t.moment.swap}
          style={styles.inset}>
          <Image source={swapped ? moment.back : moment.front} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        </Pressable>
        {place ? (
          <View style={styles.place}>
            <MapPin size={12} color="#FFFFFF" />
            <Txt variant="caption" color="#FFFFFF">
              {place}
            </Txt>
          </View>
        ) : null}
        <Animated.View pointerEvents="none" style={[styles.burst, burstStyle]}>
          <Heart size={96} color="#FFFFFF" fill="#FFFFFF" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

/** Publicación del día. Doble toque en la foto para dar "me gusta", con un corazón que late. */
export const MomentCard = memo(({ moment, uid, now, onLike, onMore, onAuthorPress }: MomentCardProps) => {
  const c = usePalette();
  const { t } = useLang();
  const liked = moment.likes.includes(uid);
  const burst = useSharedValue(0);
  const heart = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }));

  const like = (fromDoubleTap: boolean) => {
    playHaptic('medium');
    if (fromDoubleTap) {
      burst.value = withSequence(withSpring(1, motion.spring.bouncy), withDelay(420, withTiming(0, { duration: 220 })));
      // Como en Instagram: el doble toque solo da "me gusta", nunca lo quita.
      if (liked) return;
    }
    heart.value = withSequence(withSpring(1.3, motion.spring.snappy), withSpring(1, motion.spring.bouncy));
    onLike(moment);
  };

  return (
    // La sombra va en una capa exterior: en iOS, overflow "hidden" la recortaría.
    <View style={[styles.shadow, { backgroundColor: c.card }, c.scheme === 'light' && elevation.card]}>
      <View style={styles.card}>
        <MomentHeader moment={moment} uid={uid} now={now} onMore={onMore} onAuthorPress={onAuthorPress} />
        <MomentMedia moment={moment} burst={burst} onDoubleTap={() => like(true)} />
        <View style={styles.foot}>
          <PressableScale onPress={() => like(false)} scaleTo={0.85} hitSlop={10} accessibilityLabel={liked ? t.moment.unlike : t.moment.like}>
            <Animated.View style={heartStyle}>
              <Heart size={26} color={liked ? brand.pink : c.label} fill={liked ? brand.pink : 'transparent'} />
            </Animated.View>
          </PressableScale>
          <Txt variant="subhead" color={c.secondary} style={{ flex: 1 }}>
            {t.moment.likes(moment.likes.length)}
          </Txt>
        </View>
        {moment.caption ? (
          <Txt variant="callout" style={styles.caption}>
            {moment.caption}
          </Txt>
        ) : null}
      </View>
    </View>
  );
});

MomentCard.displayName = 'MomentCard';

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.lg, borderCurve: 'continuous' },
  card: { borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden', paddingBottom: space.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md, paddingLeft: space.lg, paddingRight: space.sm },
  author: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  media: { width: '100%', aspectRatio: 4 / 5 },
  inset: {
    position: 'absolute', top: space.md, left: space.md, width: '30%', aspectRatio: 3 / 4,
    borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#000000',
  },
  place: {
    position: 'absolute', left: space.md, bottom: space.md, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
  },
  burst: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  foot: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.md },
  caption: { paddingHorizontal: space.lg, paddingTop: space.sm },
});
