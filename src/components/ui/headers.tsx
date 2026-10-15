import { ChevronLeft, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, usePalette } from '@/constants/theme';

import { IconButton } from './icon-button';
import { Txt } from './text';

/** Título grande al estilo iOS, con subtítulo y acciones a la derecha. */
export const LargeHeader = ({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) => {
  const c = usePalette();
  return (
    <View style={styles.large}>
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <Txt variant="footnote" color={c.secondary} style={{ marginBottom: 2 }}>
            {subtitle}
          </Txt>
        ) : null}
        <Txt variant="largeTitle" numberOfLines={1}>
          {title}
        </Txt>
      </View>
      {right ? <View style={styles.actions}>{right}</View> : null}
    </View>
  );
};

/** Encabezado de secciones dentro de una pantalla. */
export const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => {
  const c = usePalette();
  return (
    <View style={styles.section}>
      <View style={{ flex: 1 }}>
        <Txt variant="title2">{title}</Txt>
        {subtitle ? (
          <Txt variant="footnote" color={c.secondary}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {action}
    </View>
  );
};

type SheetHeaderProps = {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  closeLabel: string;
  right?: React.ReactNode;
  /** "back" para pantallas que entran desde la derecha (flecha), "close" para modales (X). */
  variant?: 'close' | 'back';
};

/** Encabezado de pantallas secundarias: cerrar o volver a la izquierda, título al centro, acción a la derecha. */
export const SheetHeader = ({ title, subtitle, onClose, closeLabel, right, variant = 'close' }: SheetHeaderProps) => {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const Icon = variant === 'back' ? ChevronLeft : X;
  return (
    <View style={[styles.sheet, { paddingTop: insets.top + space.sm, backgroundColor: c.background, borderBottomColor: c.separator }]}>
      <IconButton icon={<Icon size={variant === 'back' ? 24 : 20} color={c.label} />} label={closeLabel} onPress={onClose} size={36} />
      <View style={styles.sheetTitle}>
        <Txt variant="headline" numberOfLines={1}>
          {title}
        </Txt>
        {typeof subtitle === 'string' ? (
          <Txt variant="caption" color={c.secondary} numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : (
          subtitle
        )}
      </View>
      <View style={styles.sheetRight}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  large: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.md, gap: space.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: 4 },
  section: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  sheet: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: space.md,
  },
  sheetTitle: { flex: 1, alignItems: 'center' },
  sheetRight: { minWidth: 36, alignItems: 'flex-end' },
});
