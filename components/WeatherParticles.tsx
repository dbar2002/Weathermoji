import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, StyleSheet, Dimensions, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

type ParticleType = 'rain' | 'heavy-rain' | 'storm' | 'snow' | 'none';

interface Props {
  type: ParticleType;
}

export default function WeatherParticles({ type }: Props) {
  if (type === 'none') return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {(type === 'rain' || type === 'heavy-rain' || type === 'storm') && <RainEffect heavy={type !== 'rain'} />}
      {type === 'storm' && <LightningEffect />}
      {type === 'snow' && <SnowEffect />}
    </View>
  );
}

// ── Rain ─────────────────────────────────────────────────

function RainEffect({ heavy }: { heavy: boolean }) {
  const count = heavy ? 40 : 20;
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * W,
      delay: Math.random() * 1500,
      duration: 600 + Math.random() * 400,
      height: 15 + Math.random() * 20,
      opacity: 0.15 + Math.random() * 0.25,
    })),
    [count]
  );

  return (
    <>
      {drops.map((drop) => (
        <RainDrop key={drop.id} {...drop} />
      ))}
    </>
  );
}

function RainDrop({ x, delay, duration, height, opacity }: {
  x: number; delay: number; duration: number; height: number; opacity: number;
}) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: H + 50, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(fade, { toValue: opacity, duration: 100, useNativeDriver: true }),
            Animated.timing(fade, { toValue: opacity, duration: duration - 200, useNativeDriver: true }),
            Animated.timing(fade, { toValue: 0, duration: 100, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(translateY, { toValue: -50, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: 1.5,
        height,
        backgroundColor: '#fff',
        borderRadius: 1,
        opacity: fade,
        transform: [{ translateY }, { rotate: '10deg' }],
      }}
    />
  );
}

// ── Snow ─────────────────────────────────────────────────

function SnowEffect() {
  const flakes = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * W,
      delay: Math.random() * 3000,
      duration: 4000 + Math.random() * 3000,
      size: 3 + Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.4,
      drift: -30 + Math.random() * 60,
    })),
    []
  );

  return (
    <>
      {flakes.map((f) => (
        <SnowFlake key={f.id} {...f} />
      ))}
    </>
  );
}

function SnowFlake({ x, delay, duration, size, opacity, drift }: {
  x: number; delay: number; duration: number; size: number; opacity: number; drift: number;
}) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: H + 20, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: drift, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(fade, { toValue: opacity, duration: 500, useNativeDriver: true }),
            Animated.timing(fade, { toValue: opacity, duration: duration - 1000, useNativeDriver: true }),
            Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -20, duration: 0, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        opacity: fade,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

// ── Lightning ────────────────────────────────────────────

function LightningEffect() {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const doFlash = () => {
      const delay = 3000 + Math.random() * 6000;
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(flash, { toValue: 0.3, duration: 80, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0.15, duration: 80, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => doFlash());
      }, delay);
    };
    doFlash();
  }, []);

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        opacity: flash,
      }}
    />
  );
}
