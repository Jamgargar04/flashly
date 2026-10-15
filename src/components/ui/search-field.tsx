import { Search, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { radius, space, usePalette } from '@/constants/theme';

import { useTypeStyle } from './text';

type SearchFieldProps = { value: string; onChange: (text: string) => void; placeholder: string; clearLabel: string };

/** Buscador al estilo iOS: lupa, texto y botón para borrar. */
export const SearchField = ({ value, onChange, placeholder, clearLabel }: SearchFieldProps) => {
  const c = usePalette();
  const typeStyle = useTypeStyle('body');
  return (
    <View style={[styles.box, { backgroundColor: c.fill }]}>
      <Search size={17} color={c.secondary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.secondary}
        selectionColor={c.tint}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={[typeStyle, styles.input, { color: c.label }]}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityRole="button" accessibilityLabel={clearLabel}>
          <View style={[styles.clear, { backgroundColor: c.tertiary }]}>
            <X size={12} color={c.card} strokeWidth={3} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 40, borderRadius: radius.sm, borderCurve: 'continuous', paddingHorizontal: space.md },
  input: { flex: 1, paddingVertical: 0 },
  clear: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
