import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Heart, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand, radius, space, usePalette } from '@/constants/theme';
import type { Moment } from '@/domain/moment';

import { timeAgo } from './time-format';
import { Avatar, Card, Chip, Txt } from './ui';

export const MomentCard = ({ moment, uid, onLike, onDelete }: { moment: Moment; uid: string; onLike: (moment: Moment) => void; onDelete?: () => void }) => {
  const c = usePalette();
  const [swapped, setSwapped] = useState(false);
  const liked = moment.likes.includes(uid);
  const main = swapped ? moment.front : moment.back;
  const inset = swapped ? moment.back : moment.front;

  const like = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onLike(moment);
  };

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View style={styles.head}>
        <Avatar name={moment.authorName} source={moment.avatar} size={38} />
        <View style={{ flex: 1 }}>
          <Txt variant="headline" numberOfLines={1}>
            {moment.authorName}
          </Txt>
          {moment.authorGroup ? (
            <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
              {moment.authorGroup}
            </Txt>
          ) : null}
        </View>
        {moment.late ? <Chip label="Tarde" /> : null}
        <Txt variant="footnote" color={c.secondary}>
          {timeAgo(moment.createdAt)}
        </Txt>
        {onDelete ? (
          <Pressable hitSlop={12} accessibilityRole="button" accessibilityLabel="Borrar momento" onPress={onDelete}>
            <Trash2 size={18} color={c.secondary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.media}>
        <Image source={main} style={StyleSheet.absoluteFill} contentFit="cover" transition={220} />
        <Pressable onPress={() => setSwapped((s) => !s)} accessibilityRole="button" accessibilityLabel="Intercambiar fotos" style={styles.inset}>
          <Image source={inset} style={StyleSheet.absoluteFill} contentFit="cover" transition={220} />
        </Pressable>
      </View>
      <View style={styles.foot}>
        <Txt variant="subhead" style={{ flex: 1 }} color={moment.caption ? c.label : c.tertiary}>
          {moment.caption || 'Sin comentario'}
        </Txt>
        <Pressable hitSlop={12} accessibilityRole="button" accessibilityLabel={liked ? 'Quitar reacción' : 'Reaccionar'} onPress={like} style={styles.like}>
          <Heart size={24} color={liked ? brand.pink : c.secondary} fill={liked ? brand.pink : 'transparent'} />
          <Txt variant="subhead" color={c.secondary}>
            {moment.likes.length}
          </Txt>
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, paddingHorizontal: space.lg },
  media: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#14121F' },
  inset: {
    position: 'absolute', top: space.md, left: space.md, width: '30%', aspectRatio: 3 / 4,
    borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF',
  },
  foot: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  like: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
