import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useFeed } from '@/application/feed-store';
import { useLang } from '@/application/use-lang';
import { space } from '@/constants/theme';
import { CAMPUS_PLACES, countByPlace } from '@/domain/place';

import { PlaceTile } from '../place-tile';
import { SectionHeader } from '../ui';

/** Lugares del campus con los momentos publicados desde cada uno hoy, en vivo. */
export const PlacesSection = () => {
  const { t } = useLang();
  const locked = useFeed((s) => s.own === null);
  const counts = countByPlace(useFeed((s) => s.moments));
  // Los lugares con más movimiento primero.
  const places = [...CAMPUS_PLACES].sort((a, b) => counts[b] - counts[a]);

  return (
    <View style={styles.section}>
      <SectionHeader title={t.discover.places} subtitle={locked ? t.discover.placesLocked : undefined} />
      <View style={styles.grid}>
        {places.map((place) => (
          <PlaceTile
            key={place}
            place={place}
            count={counts[place]}
            locked={locked}
            onPress={() => router.push({ pathname: '/place/[name]', params: { name: place } })}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { paddingHorizontal: space.xl, gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
