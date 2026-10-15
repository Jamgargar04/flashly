import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** Si el teclado está abierto (para quitar el margen inferior de la barra de escribir). */
export const useKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
};
