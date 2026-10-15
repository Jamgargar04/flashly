import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { radius, space, usePalette } from '@/constants/theme';

import { Txt, useTypeStyle } from './text';

type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Mensaje de error debajo del campo (o true para solo marcar el borde). */
  error?: string | boolean;
  hint?: string;
  /** Elemento a la derecha dentro del campo (por ejemplo, mostrar contraseña). */
  right?: React.ReactNode;
};

/** Campo de texto con etiqueta, contador de caracteres y borde que se ilumina al escribir. */
export const Field = ({ label, error, hint, right, maxLength, value, multiline, onFocus, onBlur, ...props }: FieldProps) => {
  const c = usePalette();
  const typeStyle = useTypeStyle('body');
  const [focused, setFocused] = useState(false);
  const length = value?.length ?? 0;
  const showCounter = !!maxLength && (focused || length > maxLength * 0.8);
  const borderColor = error ? c.danger : focused ? c.tint : c.separator;
  const message = typeof error === 'string' && error ? error : hint;

  return (
    <View style={styles.wrap}>
      <Txt variant="footnote" color={c.secondary} style={styles.label}>
        {label}
      </Txt>
      <View style={[styles.box, { backgroundColor: c.card, borderColor }, multiline && styles.multilineBox]}>
        <TextInput
          {...props}
          value={value}
          maxLength={maxLength}
          multiline={multiline}
          placeholderTextColor={c.tertiary}
          selectionColor={c.tint}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[typeStyle, styles.input, { color: c.label }, multiline && styles.multilineInput]}
        />
        {right}
      </View>
      {message || showCounter ? (
        <View style={styles.footer}>
          <Txt variant="footnote" color={typeof error === 'string' && error ? c.danger : c.secondary} style={{ flex: 1 }}>
            {message ?? ''}
          </Txt>
          {showCounter ? (
            <Txt variant="caption" color={length >= (maxLength ?? 0) ? c.danger : c.tertiary}>
              {`${length}/${maxLength}`}
            </Txt>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { marginLeft: 4 },
  box: {
    flexDirection: 'row', alignItems: 'center', minHeight: 52, borderRadius: radius.md, borderCurve: 'continuous',
    borderWidth: 1, paddingHorizontal: space.lg,
  },
  multilineBox: { alignItems: 'flex-start', paddingVertical: space.sm },
  input: { flex: 1, paddingVertical: space.md },
  multilineInput: { minHeight: 72, maxHeight: 160, textAlignVertical: 'top', paddingVertical: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: 4 },
});
