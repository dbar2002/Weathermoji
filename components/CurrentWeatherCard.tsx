import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, SHADOWS, type GradientKey } from '../constants/theme';
import { getWeatherMeta, getTempMessage } from '../utils/weatherMeta';
import WeatherFace from './WeatherFace';
import type { CurrentWeather, UnitSystem } from '../utils/weatherApi';

interface Props {
  current: CurrentWeather;
  city: string;
  country: string;
  unit: UnitSystem;
  onToggleUnit: () => void;
}

export default function CurrentWeatherCard({ current, city, country, unit, onToggleUnit }: Props) {
  const meta = getWeatherMeta(current.conditionCode, current.isNight);
  const gradient = COLORS[meta.bg as GradientKey] || COLORS.gradientSunny;
  const tempC = unit === 'metric' ? current.temp : ((current.temp - 32) * 5) / 9;
  const msg = getTempMessage(tempC);
  const unitSymbol = unit === 'metric' ? '°C' : '°F';

  return (
    <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.header}>
        <Text style={s.city}>📍 {city}{country ? `, ${country}` : ''}</Text>
        <TouchableOpacity onPress={onToggleUnit} style={s.unitToggle}>
          <Text style={s.unitText}>{unitSymbol}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.faceRow}>
        <WeatherFace temp={tempC} conditionCode={current.conditionCode} isNight={current.isNight} size={100} />
      </View>

      <Text style={s.temp}>{current.temp}°</Text>
      <Text style={s.label}>{meta.label}</Text>
      <Text style={s.funMessage}>{msg}</Text>

      <View style={s.detailsRow}>
        {[
          { icon: '🌡️', label: 'Feels', val: `${current.feelsLike}°` },
          { icon: '💧', label: 'Humidity', val: `${current.humidity}%` },
          { icon: '💨', label: 'Wind', val: `${Math.round(current.windSpeed)} ${unit === 'metric' ? 'm/s' : 'mph'}` },
        ].map((d, i) => (
          <View key={i} style={[s.detailItem, i > 0 && s.divider]}>
            <Text style={s.detailEmoji}>{d.icon}</Text>
            <Text style={s.detailLabel}>{d.label}</Text>
            <Text style={s.detailValue}>{d.val}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.card, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  city: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: '#fff', flex: 1 },
  unitToggle: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill },
  unitText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: '#fff' },
  faceRow: { alignItems: 'center', marginVertical: SPACING.md },
  temp: { fontSize: FONT_SIZES.heroTemp, fontFamily: FONTS.bold, color: '#fff', textAlign: 'center', lineHeight: FONT_SIZES.heroTemp * 1.1 },
  label: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: SPACING.xs },
  funMessage: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 2, marginBottom: SPACING.lg },
  detailsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.sm },
  detailItem: { flex: 1, alignItems: 'center' },
  divider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  detailEmoji: { fontSize: 20, marginBottom: 2 },
  detailLabel: { fontSize: FONT_SIZES.micro, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.7)' },
  detailValue: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: '#fff', marginTop: 2 },
});
