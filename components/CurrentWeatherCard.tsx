import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
import { getWeatherMeta, getTempMessage } from '../utils/weatherMeta';
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
  const tempC = unit === 'metric' ? current.temp : ((current.temp - 32) * 5) / 9;
  const msg = getTempMessage(tempC);
  const unitSymbol = unit === 'metric' ? '°C' : '°F';

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.city}>{city}{country ? `, ${country}` : ''}</Text>
        <TouchableOpacity onPress={onToggleUnit} style={s.unitToggle}>
          <Text style={s.unitText}>{unitSymbol}</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.temp}>{current.temp}°</Text>
      <Text style={s.label}>{meta.label}</Text>
      <Text style={s.funMessage}>{msg}</Text>

      <View style={s.detailsRow}>
        {[
          { label: 'Feels', val: `${current.feelsLike}°` },
          { label: 'Humidity', val: `${current.humidity}%` },
          { label: 'Wind', val: `${Math.round(current.windSpeed)} ${unit === 'metric' ? 'm/s' : 'mph'}` },
        ].map((d, i) => (
          <View key={i} style={[s.detailItem, i > 0 && s.divider]}>
            <Text style={s.detailLabel}>{d.label}</Text>
            <Text style={s.detailValue}>{d.val}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, paddingTop: SPACING.xl + 20, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  city: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: '#fff', flex: 1 },
  unitToggle: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill },
  unitText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: '#fff' },
  temp: { fontSize: 80, fontFamily: FONTS.bold, color: '#fff', textAlign: 'center', lineHeight: 88 },
  label: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: SPACING.xs },
  funMessage: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 2, marginBottom: SPACING.md },
  detailsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.sm },
  detailItem: { flex: 1, alignItems: 'center' },
  divider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)' },
  detailLabel: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  detailValue: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: '#fff', marginTop: 2 },
});
