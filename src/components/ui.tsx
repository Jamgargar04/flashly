import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View,
  type ImageSourcePropType, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';

import { brand, gradient, radius, space, type, usePalette } from '@/constants/theme';

type Variant = keyof typeof type;

export function Txt(props: {
  variant?: Variant;
  color?: string;
  center?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}) {
  const c = usePalette();
  return (
    <Text
      numberOfLines={props.numberOfLines}
      style={[type[props.variant ?? 'body'], { color: props.color ?? c.label }, props.center && { textAlign: 'center' }, props.style]}>
      {props.children}
    </Text>
  );
}

export function LargeHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const c = usePalette();
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <Txt variant="footnote" color={c.secondary} style={{ marginBottom: 2 }}>
            {subtitle}
          </Txt>
        ) : null}
        <Txt variant="largeTitle">{title}</Txt>
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style, padded = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const c = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: c.card }, c.scheme === 'light' && styles.cardShadow, padded && { padding: space.lg }, style]}>
      {children}
    </View>
  );
}

export type ButtonVariant = 'primary' | 'flash' | 'secondary' | 'plain' | 'destructive';

export function Button(props: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette();
  const variant = props.variant ?? 'primary';
  const color =
    variant === 'primary' ? '#FFFFFF' : variant === 'flash' ? brand.flashInk : variant === 'destructive' ? c.danger : c.tint;
  const height = props.compact ? 44 : 54;
  const press = () => {
    if (props.disabled || props.loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    props.onPress?.();
  };
  const content = props.loading ? (
    <ActivityIndicator color={color} />
  ) : (
    <View style={styles.buttonRow}>
      {props.icon}
      <Txt variant="headline" color={color}>
        {props.title}
      </Txt>
    </View>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.title}
      onPress={press}
      disabled={props.disabled || props.loading}
      style={({ pressed }) => [
        { opacity: props.disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        props.style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, { height }]}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.button,
            {
              height,
              backgroundColor: variant === 'flash' ? brand.flash : variant === 'secondary' ? c.fill : 'transparent',
            },
          ]}>
          {content}
        </View>
      )}
    </Pressable>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: boolean }) {
  const c = usePalette();
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="footnote" color={c.secondary} style={{ marginLeft: 4 }}>
        {label}
      </Txt>
      <TextInput
        placeholderTextColor={c.tertiary}
        style={[type.body, styles.input, { color: c.label, backgroundColor: c.card, borderColor: error ? c.danger : c.separator }]}
        {...props}
      />
    </View>
  );
}

/** Lista agrupada al estilo de Ajustes de iOS. */
export function Group({ title, footer, children }: { title?: string; footer?: string; children: React.ReactNode }) {
  const c = usePalette();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: 6 }}>
      {title ? (
        <Txt variant="footnote" color={c.secondary} style={styles.groupLabel}>
          {title}
        </Txt>
      ) : null}
      <View style={[styles.group, { backgroundColor: c.card }]}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 ? <View style={[styles.separator, { backgroundColor: c.separator }]} /> : null}
          </View>
        ))}
      </View>
      {footer ? (
        <Txt variant="footnote" color={c.secondary} style={styles.groupLabel}>
          {footer}
        </Txt>
      ) : null}
    </View>
  );
}

export function Row(props: {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  value?: string;
  right?: React.ReactNode;
  destructive?: boolean;
  onPress?: () => void;
}) {
  const c = usePalette();
  const body = (
    <View style={styles.row}>
      {props.icon ? <View style={[styles.rowIcon, { backgroundColor: props.iconColor ?? c.tint }]}>{props.icon}</View> : null}
      <Txt style={{ flex: 1 }} color={props.destructive ? c.danger : c.label}>
        {props.title}
      </Txt>
      {props.value ? <Txt color={c.secondary}>{props.value}</Txt> : null}
      {props.right}
      {props.onPress && !props.right && !props.destructive ? <ChevronRight size={18} color={c.tertiary} /> : null}
    </View>
  );
  if (!props.onPress) return body;
  return (
    <Pressable onPress={props.onPress} accessibilityRole="button" style={({ pressed }) => pressed && { backgroundColor: c.fill }}>
      {body}
    </Pressable>
  );
}

export function Chip({ label, color, textColor }: { label: string; color?: string; textColor?: string }) {
  const c = usePalette();
  return (
    <View style={[styles.chip, { backgroundColor: color ?? c.fill }]}>
      <Txt variant="caption" color={textColor ?? c.secondary}>
        {label}
      </Txt>
    </View>
  );
}

export function Avatar({ name, source, size = 40 }: { name: string; source?: ImageSourcePropType; size?: number }) {
  if (source) {
    return <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
  }
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[type.headline, { color: '#FFFFFF', fontSize: size * 0.38, lineHeight: size * 0.46 }]}>{initials || '?'}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.md, gap: space.md },
  card: { borderRadius: radius.lg, borderCurve: 'continuous' },
  cardShadow: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  button: { borderRadius: radius.md, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: { height: 52, borderRadius: radius.md, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.lg },
  group: { borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden' },
  groupLabel: { marginHorizontal: space.lg },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.lg, gap: space.md },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 10, height: 24, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
