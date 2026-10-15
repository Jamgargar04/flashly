import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { gradient, space, usePalette } from '@/constants/theme';

import { Button } from './button';
import { Card } from './card';
import { Txt } from './text';

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
  /** Sin tarjeta, para pantallas completas. */
  bare?: boolean;
};

/** Qué es esto, por qué está vacío y cómo empezar. */
export const EmptyState = ({ icon, title, body, action, bare }: EmptyStateProps) => {
  const c = usePalette();
  const content = (
    <Animated.View entering={FadeIn.duration(260)} style={styles.content}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
        {icon}
      </LinearGradient>
      <Txt variant="headline" center>
        {title}
      </Txt>
      {body ? (
        <Txt variant="subhead" color={c.secondary} center>
          {body}
        </Txt>
      ) : null}
      {action ? <Button title={action.label} variant="tinted" compact onPress={action.onPress} style={styles.action} /> : null}
    </Animated.View>
  );
  if (bare) return <View style={styles.bare}>{content}</View>;
  return <Card style={styles.card}>{content}</Card>;
};

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: space.sm },
  icon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  card: { paddingVertical: space.xxl, paddingHorizontal: space.xl },
  bare: { paddingVertical: space.xxxl, paddingHorizontal: space.xxl },
  action: { marginTop: space.sm, alignSelf: 'stretch' },
});
