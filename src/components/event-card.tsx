import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useLang } from '@/application/use-lang';
import { brand, elevation, gradient, radius, space, system, usePalette } from '@/constants/theme';
import { eventStatus, type CampusEvent } from '@/domain/event';
import { isCampusPlace } from '@/domain/place';

import { calendarBadge, relativeDay, timeRange } from './time-format';
import { PressableScale, Txt } from './ui';

type EventPreview = Pick<CampusEvent, 'title' | 'startsAt' | 'endsAt' | 'location' | 'imageUrl'>;

/** Portada del evento: la imagen real o, si no tiene, un degradado de la marca. */
export const EventCover = ({ imageUri, style }: { imageUri?: string; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.cover, style]}>
    {imageUri ? (
      <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
    ) : (
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.placeholder]}>
        <CalendarDays size={40} color="rgba(255,255,255,0.85)" />
      </LinearGradient>
    )}
  </View>
);

/** Insignia de calendario (OCT / 16) y estado en vivo sobre la portada. */
const CoverOverlay = ({ event, now }: { event: EventPreview; now: number }) => {
  const { t } = useLang();
  const status = eventStatus(event, now);
  const badge = calendarBadge(t.time, event.startsAt);
  return (
    <>
      <View style={styles.dateBadge}>
        <Txt variant="caption" color={system.red}>
          {badge.month}
        </Txt>
        <Txt variant="title3" color="#000000" style={{ lineHeight: 22 }}>
          {badge.day}
        </Txt>
      </View>
      {status === 'live' || status === 'soon' ? (
        <View style={[styles.status, { backgroundColor: status === 'live' ? system.red : brand.flash }]}>
          {status === 'live' ? <View style={styles.liveDot} /> : null}
          <Txt variant="caption" color={status === 'live' ? '#FFFFFF' : brand.flashInk}>
            {status === 'live' ? t.event.live : t.event.soon}
          </Txt>
        </View>
      ) : null}
    </>
  );
};

/** Lugar del evento traducido si es uno del campus. */
export const usePlaceLabel = () => {
  const { t } = useLang();
  return (location?: string) => (location && isCampusPlace(location) ? t.places[location] : location);
};

type EventCardProps = { event: EventPreview; now: number; onPress?: () => void; width?: number };

/** Tarjeta de evento para el carrusel de Descubrir y la vista previa del formulario. */
export const EventCard = ({ event, now, onPress, width }: EventCardProps) => {
  const c = usePalette();
  const { t } = useLang();
  const placeLabel = usePlaceLabel();
  const place = placeLabel(event.location);
  return (
    <PressableScale onPress={onPress} disabled={!onPress} accessibilityLabel={event.title} style={[styles.card, { width, backgroundColor: c.card }, c.scheme === 'light' && elevation.card]}>
      <View style={styles.clip}>
        <EventCover imageUri={event.imageUrl} />
        <CoverOverlay event={event} now={now} />
        <View style={styles.body}>
          <Txt variant="headline" numberOfLines={2}>
            {event.title}
          </Txt>
          <View style={styles.meta}>
            <Clock size={13} color={c.secondary} />
            <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
              {`${relativeDay(t.time, event.startsAt, now)} · ${timeRange(event.startsAt, event.endsAt)}`}
            </Txt>
          </View>
          {place ? (
            <View style={styles.meta}>
              <MapPin size={13} color={c.secondary} />
              <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
                {place}
              </Txt>
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderCurve: 'continuous' },
  clip: { borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#14121F' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  dateBadge: {
    position: 'absolute', top: space.md, left: space.md, width: 46, paddingVertical: 4, borderRadius: radius.sm,
    borderCurve: 'continuous', backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center',
  },
  status: {
    position: 'absolute', top: space.md, right: space.md, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, height: 26, borderRadius: radius.pill,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  body: { padding: space.lg, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
