import { Check, UserPlus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useLang } from '@/application/use-lang';
import { elevation, radius, space, usePalette } from '@/constants/theme';
import type { Classmate } from '@/domain/classmate';
import { firstName } from '@/domain/student';

import { Avatar, PressableScale, Txt } from './ui';

/** Botón Seguir / Siguiendo: cambia de color al instante (la sincronización va por detrás). */
export const FollowButton = ({ following, onPress, wide }: { following: boolean; onPress: () => void; wide?: boolean }) => {
  const c = usePalette();
  const { t } = useLang();
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={0.92}
      accessibilityLabel={following ? t.discover.following : t.discover.follow}
      accessibilityState={{ selected: following }}
      style={[styles.follow, wide && styles.followWide, { backgroundColor: following ? c.fill : c.tint }]}>
      {following ? <Check size={15} color={c.tint} /> : <UserPlus size={15} color="#FFFFFF" />}
      <Txt variant="subhead" color={following ? c.tint : '#FFFFFF'}>
        {following ? t.discover.following : t.discover.follow}
      </Txt>
    </PressableScale>
  );
};

type PersonCardProps = { person: Classmate; following: boolean; onToggleFollow: () => void; onPress: () => void };

/**
 * Tarjeta de persona en el carrusel de Descubrir. La foto y el nombre abren su perfil;
 * "Seguir" es un botón aparte (no anidado), así los lectores de pantalla los anuncian por separado.
 */
export const PersonCard = ({ person, following, onToggleFollow, onPress }: PersonCardProps) => {
  const c = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: c.card }, c.scheme === 'light' && elevation.card]}>
      <PressableScale onPress={onPress} accessibilityLabel={person.name} style={styles.identity}>
        <Avatar name={person.name} uri={person.photoUrl} source={person.avatar} size={64} />
        <Txt variant="headline" center numberOfLines={1}>
          {firstName(person.name)}
        </Txt>
        <Txt variant="caption" color={c.secondary} center numberOfLines={1}>
          {person.group || ' '}
        </Txt>
      </PressableScale>
      <FollowButton following={following} onPress={onToggleFollow} />
    </View>
  );
};

/** Fila de persona para resultados de búsqueda. */
export const PersonRow = ({ person, following, onToggleFollow, onPress }: PersonCardProps) => {
  const c = usePalette();
  return (
    <View style={styles.row}>
      <PressableScale onPress={onPress} scaleTo={0.98} accessibilityLabel={person.name} style={styles.rowIdentity}>
        <Avatar name={person.name} uri={person.photoUrl} source={person.avatar} size={44} />
        <View style={{ flex: 1 }}>
          <Txt variant="headline" numberOfLines={1}>
            {person.name}
          </Txt>
          {person.group ? (
            <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
              {person.group}
            </Txt>
          ) : null}
        </View>
      </PressableScale>
      <FollowButton following={following} onPress={onToggleFollow} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  rowIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  identity: { alignItems: 'center', gap: 6, alignSelf: 'stretch' },
  card: {
    width: 148, alignItems: 'center', gap: space.md, paddingVertical: space.lg, paddingHorizontal: space.md,
    borderRadius: radius.lg, borderCurve: 'continuous',
  },
  follow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, height: 32, borderRadius: radius.pill },
  followWide: { alignSelf: 'stretch', justifyContent: 'center', height: 44 },
});
