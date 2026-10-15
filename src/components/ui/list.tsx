import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, usePalette } from '@/constants/theme';

import { Txt } from './text';

/** Lista agrupada al estilo de Ajustes de iOS. */
export const Group = ({ title, footer, children }: { title?: string; footer?: string; children: React.ReactNode }) => {
  const c = usePalette();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: 6 }}>
      {title ? (
        <Txt variant="footnote" color={c.secondary} style={styles.groupLabel}>
          {title.toUpperCase()}
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
};

type RowProps = {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  right?: React.ReactNode;
  destructive?: boolean;
  onPress?: () => void;
};

export const Row = ({ icon, iconColor, title, subtitle, value, right, destructive, onPress }: RowProps) => {
  const c = usePalette();
  const body = (
    <View style={styles.row}>
      {icon ? <View style={[styles.rowIcon, { backgroundColor: iconColor ?? c.tint }]}>{icon}</View> : null}
      <View style={{ flex: 1, paddingVertical: space.md }}>
        <Txt color={destructive ? c.danger : c.label}>{title}</Txt>
        {subtitle ? (
          <Txt variant="footnote" color={c.secondary}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {value ? <Txt color={c.secondary}>{value}</Txt> : null}
      {right}
      {onPress && !right && !destructive ? <ChevronRight size={18} color={c.tertiary} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => pressed && { backgroundColor: c.fill }}>
      {body}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  group: { borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden' },
  groupLabel: { marginHorizontal: space.lg },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 58 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.lg, gap: space.md },
  rowIcon: { width: 30, height: 30, borderRadius: 8, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
