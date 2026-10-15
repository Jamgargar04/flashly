import { Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useLang } from '@/application/use-lang';
import { elevation, radius, space, usePalette } from '@/constants/theme';
import type { CampusPlace } from '@/domain/place';

import { PLACE_VISUALS } from './place-visuals';
import { PressableScale, Txt } from './ui';

type PlaceTileProps = { place: CampusPlace; count: number; locked: boolean; onPress: () => void };

/** Lugar del campus con cuántos momentos se publicaron desde ahí hoy (en vivo). */
export const PlaceTile = ({ place, count, locked, onPress }: PlaceTileProps) => {
  const c = usePalette();
  const { t } = useLang();
  const { Icon, color } = PLACE_VISUALS[place];
  const active = !locked && count > 0;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${t.places[place]}, ${locked ? t.today.lockedTitle : t.discover.placeCount(count)}`}
      style={[styles.tile, { backgroundColor: c.card }, c.scheme === 'light' && elevation.card]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: color }]}>
          <Icon size={20} color="#FFFFFF" />
        </View>
        {active ? (
          <View style={[styles.count, { backgroundColor: c.tint }]}>
            <Txt variant="caption" color="#FFFFFF">
              {String(count)}
            </Txt>
          </View>
        ) : null}
      </View>
      <Txt variant="headline" numberOfLines={1}>
        {t.places[place]}
      </Txt>
      <View style={styles.meta}>
        {locked ? <Lock size={12} color={c.secondary} /> : null}
        <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
          {locked ? t.today.lockedTitle : t.discover.placeCount(count)}
        </Txt>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  tile: { width: '48%', flexGrow: 1, gap: 4, padding: space.lg, borderRadius: radius.lg, borderCurve: 'continuous' },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.xs },
  icon: { width: 38, height: 38, borderRadius: 10, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  count: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
