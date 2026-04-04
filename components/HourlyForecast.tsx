import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, SHADOWS } from '../constants/theme';
import WeatherFace from './WeatherFace';
import type { HourlyItem } from '../utils/weatherApi';

export default function HourlyForecast({ hourly }: { hourly: HourlyItem[] }) {
  if (!hourly?.length) return null;

  const formatTime = (ts: number): string => {
    const h = new Date(ts * 1000).getHours();
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  const isNightHour = (ts: number): boolean => {
    const h = new Date(ts * 1000).getHours();
    return h < 6 || h >= 20;
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>⏰ Hourly</Text>
      <FlatList data={hourly} horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.list} keyExtractor={(item, i) => `h-${item.time}-${i}`}
        renderItem={({ item, index }) => {
          const isNow = index === 0;
          return (
            <View style={[s.card, isNow && s.cardNow]}>
              <Text style={[s.time, isNow && s.timeNow]}>{isNow ? 'Now' : formatTime(item.time)}</Text>
              <WeatherFace temp={item.temp} conditionCode={item.conditionCode} isNight={isNightHour(item.time)} size={30} />
              <Text style={[s.temp, isNow && s.tempNow]}>{item.temp}°</Text>
              {item.pop > 0 && <Text style={s.pop}>💧 {item.pop}%</Text>}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: SPACING.lg },
  title: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.bold, color: COLORS.text, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, alignItems: 'center', minWidth: 72, ...SHADOWS.card },
  cardNow: { backgroundColor: COLORS.accent },
  time: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.medium, color: COLORS.textLight, marginBottom: SPACING.xs },
  timeNow: { color: '#fff', fontFamily: FONTS.bold },
  temp: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginTop: SPACING.xs },
  tempNow: { color: '#fff' },
  pop: { fontSize: FONT_SIZES.micro, fontFamily: FONTS.regular, color: COLORS.rainBlue, marginTop: 2 },
});
