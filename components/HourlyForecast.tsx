import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
import WeatherFace from './WeatherFace';
import type { HourlyItem } from '../utils/weatherApi';

interface Props {
  hourly: HourlyItem[];
  timezoneOffset?: number; // seconds from UTC
}

export default function HourlyForecast({ hourly, timezoneOffset = 0 }: Props) {
  if (!hourly?.length) return null;

  // Convert UTC timestamp to the city's local hour
  const getCityHour = (ts: number): number => {
    const utcMs = ts * 1000;
    const cityMs = utcMs + timezoneOffset * 1000;
    const cityDate = new Date(cityMs);
    // Use UTC methods since we already shifted the time
    return cityDate.getUTCHours();
  };

  const formatTime = (ts: number): string => {
    const h = getCityHour(ts);
    if (h === 0) return '12a';
    if (h === 12) return '12p';
    return h > 12 ? `${h - 12}p` : `${h}a`;
  };

  const isNightHour = (ts: number) => {
    const h = getCityHour(ts);
    return h < 6 || h >= 20;
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Hourly</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.list}>
        {hourly.map((item, i) => {
          const isNow = i === 0;
          return (
            <View key={`h-${item.time}-${i}`} style={s.card}>
              <Text style={[s.time, isNow && s.timeNow]}>{isNow ? 'Now' : formatTime(item.time)}</Text>
              <WeatherFace temp={item.temp} conditionCode={item.conditionCode} isNight={isNightHour(item.time)} size={32} />
              <Text style={s.temp}>{item.temp}°</Text>
              {item.pop > 0 && <Text style={s.pop}>{item.pop}%</Text>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  title: { fontSize: 16, fontFamily: FONTS.semibold, color: 'rgba(255,255,255,0.5)', marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1 },
  list: { paddingHorizontal: SPACING.lg, gap: 6 },
  card: { alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm + 2, minWidth: 56, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16 },
  time: { fontSize: 12, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  timeNow: { color: '#fff', fontFamily: FONTS.bold },
  temp: { fontSize: 15, fontFamily: FONTS.bold, color: '#fff', marginTop: 6 },
  pop: { fontSize: 10, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
});
