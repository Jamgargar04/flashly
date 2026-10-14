import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { brand, gradient, usePalette } from '@/constants/theme';
import type { WindowPhase } from '@/domain/flash-window';

/** Elemento protagonista de la app: el anillo que anuncia y cuenta la ventana del flash. */
export function FlashRing({ phase, progress = 1, size = 236, stroke = 16, children }: {
  phase: WindowPhase;
  progress?: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const c = usePalette();
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'waiting') return;
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [phase, spin]);

  useEffect(() => {
    if (phase !== 'open') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const arc = phase === 'waiting' ? 0.72 : phase === 'open' ? Math.max(0.002, progress) : 1;
  const strokeColor = phase === 'open' ? brand.flash : phase === 'closed' ? c.tertiary : 'url(#flashGradient)';
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {phase === 'open' ? (
        <Animated.View
          style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: brand.flash,
            opacity: glowOpacity, transform: [{ scale: glowScale }],
          }}
        />
      ) : null}
      <Animated.View style={{ position: 'absolute', transform: [{ rotate: phase === 'waiting' ? rotate : '0deg' }] }}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="flashGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradient[0]} />
              <Stop offset="0.5" stopColor={gradient[1]} />
              <Stop offset="1" stopColor={gradient[2]} />
            </SvgGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.fill} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={strokeColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - arc)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}
