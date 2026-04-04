import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
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
      <Text style={s.title}>This Week</Text>
      <View style={s.card}>
        {daily.map((day, i) => {
          const leftPct = ((day.tempMin - gMin) / range) * 100;
          const widthPct = Math.max(((day.tempMax - day.tempMin) / range) * 100, 8);
          const avg = (day.tempMin + day.tempMax) / 2;
          return (
            <View key={`d-${day.date}-${i}`} style={[s.row, i < daily.length - 1 && s.rowBorder]}>
              <Text style={s.dayName}>{getDayName(day.date, i)}</Text>
              <View style={s.faceWrap}><WeatherFace temp={avg} conditionCode={day.conditionCode} size={24} /></View>
              <Text style={s.pop}>{day.pop > 0 ? `${day.pop}%` : ''}</Text>
              <View style={s.barWrap}>
                <Text style={s.tempMin}>{day.tempMin}°</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { left: `${leftPct}%`, width: `${widthPct}%` }]} />
                </View>
                <Text style={s.tempMax}>{day.tempMax}°</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.xxl },
  title: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.bold, color: '#fff', marginBottom: SPACING.sm },
  card: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  dayName: { width: 50, fontSize: FONT_SIZES.body, fontFamily: FONTS.semibold, color: '#fff' },
  faceWrap: { width: 36, alignItems: 'center' },
  pop: { width: 50, fontSize: FONT_SIZES.micro, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  barWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.sm, gap: SPACING.xs },
  tempMin: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.6)', width: 28, textAlign: 'right' },
  barTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden', position: 'relative' },
  barFill: { position: 'absolute', top: 0, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  tempMax: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.bold, color: '#fff', width: 28 },
});
