import React, { useEffect, useRef } from 'react';
import {
  View, Text, Animated, ScrollView, RefreshControl, StyleSheet,
  ActivityIndicator, StatusBar, Dimensions, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, FONT_SIZES, type GradientKey } from '../../constants/theme';
import { getWeatherMeta, getTempMessage } from '../../utils/weatherMeta';
import { useWeather } from '../../hooks/useWeather';
import SearchBar from '../../components/SearchBar';
import HourlyForecast from '../../components/HourlyForecast';
import WeeklyForecast from '../../components/WeeklyForecast';
import WeatherFace from '../../components/WeatherFace';
import WeatherParticles from '../../components/WeatherParticles';
import WeatherDetails from '../../components/WeatherDetails';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

export default function HomeScreen() {
  const { weather, loading, error, unit, refresh, selectCity, toggleUnit, searchCity } = useWeather();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Floating face
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Fade-ins
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (weather) {
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }
  }, [weather]);

  const meta = weather ? getWeatherMeta(weather.current.conditionCode, weather.current.isNight) : null;
  const gradient = meta ? COLORS[meta.bg as GradientKey] : COLORS.gradientSunny;

  const particleType = (() => {
    if (!meta) return 'none' as const;
    if (meta.type === 'storm') return 'storm' as const;
    if (meta.type === 'snow') return 'snow' as const;
    if (meta.type === 'rain') {
      const code = weather!.current.conditionCode;
      return (code >= 502 || code === 522) ? 'heavy-rain' as const : 'rain' as const;
    }
    return 'none' as const;
  })();

  // Parallax
  const faceTranslateY = Animated.add(
    floatAnim,
    scrollY.interpolate({ inputRange: [0, 300], outputRange: [0, -60], extrapolate: 'clamp' })
  );
  const faceScale = scrollY.interpolate({ inputRange: [-100, 0, 300], outputRange: [1.3, 1, 0.6], extrapolate: 'clamp' });
  const faceOpacity = scrollY.interpolate({ inputRange: [0, 250], outputRange: [1, 0], extrapolate: 'clamp' });
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

  if (loading && !weather) {
    return (
      <LinearGradient colors={[...COLORS.gradientSunny]} style={s.full}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={s.centered}>
          <WeatherFace temp={22} conditionCode={800} size={100} />
          <Text style={s.loadingText}>Finding your weather...</Text>
          <ActivityIndicator color="#fff" style={{ marginTop: SPACING.md }} />
        </View>
      </LinearGradient>
    );
  }

  if (error && !weather) {
    return (
      <LinearGradient colors={[...COLORS.gradientCloudy]} style={s.full}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={s.centered}>
          <WeatherFace temp={0} conditionCode={200} size={80} />
          <Text style={s.errorText}>{error}</Text>
          <View style={{ width: '100%' }}>
            <SearchBar onSelectCity={selectCity} searchCity={searchCity} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const tempC = unit === 'imperial' ? ((weather!.current.temp - 32) * 5) / 9 : weather!.current.temp;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 0.2, y: 1 }} style={s.full}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <WeatherParticles type={particleType} />

      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#fff" colors={['#fff']} />}
      >
        {weather && (
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>

            {/* ── Top bar: city + time ── */}
            <View style={s.topBar}>
              <View style={s.topCenter}>
                <Text style={s.cityName}>{weather.city}, {weather.country}</Text>
                <Text style={s.timeText}>{timeStr}</Text>
              </View>
              <TouchableOpacity onPress={toggleUnit} style={s.unitBtn}>
                <Text style={s.unitBtnText}>°{unit === 'imperial' ? 'F' : 'C'}</Text>
              </TouchableOpacity>
            </View>

            {/* ── Search ── */}
            <SearchBar onSelectCity={selectCity} searchCity={searchCity} />

            {/* ── Hero: face floating in open space ── */}
            <Animated.View style={[s.heroArea, { opacity: faceOpacity }]}>
              <Animated.View style={{ transform: [{ translateY: faceTranslateY }, { scale: faceScale }] }}>
                <WeatherFace
                  temp={tempC}
                  conditionCode={weather.current.conditionCode}
                  isNight={weather.current.isNight}
                  size={160}
                />
              </Animated.View>
            </Animated.View>

            {/* ── Bottom info: condition + temp ── */}
            <Animated.View style={[s.bottomInfo, { opacity: heroOpacity }]}>
              <Text style={s.conditionText}>{meta!.label}</Text>
              <View style={s.hiLoRow}>
                <Text style={s.hiLo}>↑ {weather.current.tempMax}°</Text>
                <Text style={s.hiLo}>↓ {weather.current.tempMin}°</Text>
              </View>
              <Text style={s.heroTemp}>{weather.current.temp}°</Text>
              <Text style={s.funMessage}>{getTempMessage(tempC)}</Text>
            </Animated.View>

            {/* ── Details section (below fold) ── */}
            <View style={s.detailsSection}>
              {/* Quick stats */}
              <View style={s.statsRow}>
                {[
                  { label: 'Feels like', val: `${weather.current.feelsLike}°` },
                  { label: 'Humidity', val: `${weather.current.humidity}%` },
                  { label: 'Wind', val: `${Math.round(weather.current.windSpeed)} ${unit === 'imperial' ? 'mph' : 'm/s'}` },
                ].map((d, i) => (
                  <View key={i} style={[s.statItem, i > 0 && s.statDivider]}>
                    <Text style={s.statValue}>{d.val}</Text>
                    <Text style={s.statLabel}>{d.label}</Text>
                  </View>
                ))}
              </View>

              {/* Hourly */}
              <HourlyForecast hourly={weather.hourly} />

              {/* Weekly */}
              <WeeklyForecast daily={weather.daily} />

              {/* Detail cards */}
              <WeatherDetails current={weather.current} airQuality={null /* AQI disabled for now */} unit={unit} />
            </View>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  full: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  cityName: { fontSize: 20, fontFamily: FONTS.bold, color: '#fff', textAlign: 'center' },
  timeText: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  unitBtn: {
    position: 'absolute',
    right: SPACING.lg,
    top: 62,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unitBtnText: { fontSize: 14, fontFamily: FONTS.bold, color: '#fff' },

  // Hero face area
  heroArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SCREEN_H * 0.35,
  },

  // Bottom weather info
  bottomInfo: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  conditionText: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: 'rgba(255,255,255,0.85)',
  },
  hiLoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 4,
  },
  hiLo: {
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.6)',
  },
  heroTemp: {
    fontSize: 96,
    fontFamily: FONTS.bold,
    color: '#fff',
    lineHeight: 104,
    marginTop: -4,
  },
  funMessage: {
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -4,
  },

  // Details below fold
  detailsSection: {
    paddingTop: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  statValue: { fontSize: 22, fontFamily: FONTS.bold, color: '#fff' },
  statLabel: { fontSize: FONT_SIZES.micro, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: '#fff', marginTop: SPACING.lg },
  errorText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.medium, color: '#fff', textAlign: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl },
});
