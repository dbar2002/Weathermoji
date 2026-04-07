import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONTS, FONT_SIZES } from '../constants/theme';
import WeatherFace from './WeatherFace';
import type { DailyItem } from '../utils/weatherApi';

export default function WeeklyForecast({ daily }: { daily: DailyItem[] }) {
  if (!daily?.length) return null;
  const allTemps = daily.flatMap((d) => [d.tempMin, d.tempMax]);
  const gMin = Math.min(...allTemps), gMax = Math.max(...allTemps), range = gMax - gMin || 1;

  const getDayName = (ts: number, i: number) => {
    if (i === 0) return 'Today';
    return new Date(ts * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>This week</Text>
      <View style={s.card}>
        {daily.map((day, i) => {
          const leftPct = ((day.tempMin - gMin) / range) * 100;
          const widthPct = Math.max(((day.tempMax - day.tempMin) / range) * 100, 8);
          const avg = (day.tempMin + day.tempMax) / 2;
          return (
            <View key={`d-${day.date}-${i}`} style={[s.row, i < daily.length - 1 && s.rowBorder]}>
              <Text style={[s.dayName, i === 0 && s.dayToday]}>{getDayName(day.date, i)}</Text>
              <View style={s.faceWrap}><WeatherFace temp={avg} conditionCode={day.conditionCode} size={22} /></View>
              <Text style={s.tempMin}>{day.tempMin}°</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { left: `${leftPct}%`, width: `${widthPct}%` }]} />
              </View>
              <Text style={s.tempMax}>{day.tempMax}°</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: SPACING.md, marginHorizontal: SPACING.lg, marginBottom: SPACING.xxl },
  title: { fontSize: 16, fontFamily: FONTS.semibold, color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)' },
  dayName: { width: 46, fontSize: 15, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.6)' },
  dayToday: { color: '#fff', fontFamily: FONTS.bold },
  faceWrap: { width: 30, alignItems: 'center', marginRight: 8 },
  tempMin: { fontSize: 15, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.4)', width: 32, textAlign: 'right', marginRight: 8 },
  barTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', position: 'relative' },
  barFill: { position: 'absolute', top: 0, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  tempMax: { fontSize: 15, fontFamily: FONTS.bold, color: '#fff', width: 32, marginLeft: 8 },
});
