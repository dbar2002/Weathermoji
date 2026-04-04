import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONTS, FONT_SIZES } from '../../constants/theme';
import { useWeather } from '../../hooks/useWeather';
import SearchBar from '../../components/SearchBar';
import CurrentWeatherCard from '../../components/CurrentWeatherCard';
import HourlyForecast from '../../components/HourlyForecast';
import WeeklyForecast from '../../components/WeeklyForecast';
import WeatherFace from '../../components/WeatherFace';

export default function HomeScreen() {
  const { weather, loading, error, unit, refresh, selectCity, toggleUnit, searchCity } = useWeather();

  if (loading && !weather) {
    return (
      <View style={s.centered}>
        <WeatherFace temp={22} conditionCode={800} size={80} />
        <Text style={s.loadingText}>Finding your weather...</Text>
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  if (error && !weather) {
    return (
      <View style={s.centered}>
        <WeatherFace temp={0} conditionCode={200} size={80} />
        <Text style={s.errorText}>{error}</Text>
        <View style={{ width: '100%' }}><SearchBar onSelectCity={selectCity} searchCity={searchCity} /></View>
      </View>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />}>
      <View style={s.header}>
        <Text style={s.appName}>weathermoji</Text>
        <Text style={s.tagline}>your vibes, in emoji 🎯</Text>
      </View>
      <SearchBar onSelectCity={selectCity} searchCity={searchCity} />
      {weather && (
        <>
          <CurrentWeatherCard current={weather.current} city={weather.city} country={weather.country} unit={unit} onToggleUnit={toggleUnit} />
          <HourlyForecast hourly={weather.hourly} />
          <WeeklyForecast daily={weather.daily} />
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  appName: { fontSize: FONT_SIZES.title, fontFamily: FONTS.bold, color: COLORS.text, letterSpacing: -1 },
  tagline: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 2 },
  centered: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: COLORS.text, marginTop: SPACING.lg },
  errorText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.medium, color: COLORS.accent, textAlign: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl },
});
