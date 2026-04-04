import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONTS, FONT_SIZES, type GradientKey } from '../../constants/theme';
import { getWeatherMeta } from '../../utils/weatherMeta';
import { useWeather } from '../../hooks/useWeather';
import SearchBar from '../../components/SearchBar';
import CurrentWeatherCard from '../../components/CurrentWeatherCard';
import HourlyForecast from '../../components/HourlyForecast';
import WeeklyForecast from '../../components/WeeklyForecast';
import WeatherFace from '../../components/WeatherFace';
import WeatherParticles from '../../components/WeatherParticles';

const { height: SCREEN_H } = Dimensions.get('window');

export default function HomeScreen() {
  const { weather, loading, error, unit, refresh, selectCity, toggleUnit, searchCity } = useWeather();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fade-in animations
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const fadeCard = useRef(new Animated.Value(0)).current;
  const fadeHourly = useRef(new Animated.Value(0)).current;
  const fadeWeekly = useRef(new Animated.Value(0)).current;
  const slideCard = useRef(new Animated.Value(30)).current;
  const slideHourly = useRef(new Animated.Value(30)).current;
  const slideWeekly = useRef(new Animated.Value(30)).current;

  // Floating face animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (weather) {
      // Staggered fade-in
      Animated.stagger(120, [
        Animated.timing(fadeHeader, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(fadeCard, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(slideCard, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fadeHourly, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideHourly, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fadeWeekly, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideWeekly, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [weather]);

  const meta = weather ? getWeatherMeta(weather.current.conditionCode, weather.current.isNight) : null;
  const gradient = meta ? COLORS[meta.bg as GradientKey] : COLORS.gradientSunny;

  // Determine particle effect
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

  // Parallax: face moves slower than scroll
  const faceTranslateY = Animated.add(
    floatAnim,
    scrollY.interpolate({ inputRange: [0, 300], outputRange: [0, -40], extrapolate: 'clamp' })
  );
  const faceScale = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [1.2, 1, 0.8], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 150], outputRange: [1, 0], extrapolate: 'clamp' });

  if (loading && !weather) {
    return (
      <LinearGradient colors={[...COLORS.gradientSunny]} style={s.full}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={s.centered}>
          <WeatherFace temp={22} conditionCode={800} size={80} />
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

  return (
    <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 0.3, y: 1 }} style={s.full}>
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
        {/* Header with parallax fade */}
        <Animated.View style={[s.header, { opacity: Animated.multiply(fadeHeader, headerOpacity) }]}>
          <Text style={s.appName}>weathermoji</Text>
          <Text style={s.tagline}>your vibes, visualized</Text>
        </Animated.View>

        <SearchBar onSelectCity={selectCity} searchCity={searchCity} />

        {weather && (
          <>
            {/* Floating face with parallax */}
            <Animated.View style={[s.faceContainer, { transform: [{ translateY: faceTranslateY }, { scale: faceScale }] }]}>
              <WeatherFace
                temp={unit === 'metric' ? weather.current.temp : ((weather.current.temp - 32) * 5) / 9}
                conditionCode={weather.current.conditionCode}
                isNight={weather.current.isNight}
                size={140}
              />
            </Animated.View>

            {/* Card — fade in + slide up */}
            <Animated.View style={{ opacity: fadeCard, transform: [{ translateY: slideCard }] }}>
              <CurrentWeatherCard
                current={weather.current}
                city={weather.city}
                country={weather.country}
                unit={unit}
                onToggleUnit={toggleUnit}
              />
            </Animated.View>

            {/* Hourly — fade in + slide up */}
            <Animated.View style={{ opacity: fadeHourly, transform: [{ translateY: slideHourly }] }}>
              <HourlyForecast hourly={weather.hourly} />
            </Animated.View>

            {/* Weekly — fade in + slide up */}
            <Animated.View style={{ opacity: fadeWeekly, transform: [{ translateY: slideWeekly }] }}>
              <WeeklyForecast daily={weather.daily} />
            </Animated.View>
          </>
        )}
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  full: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.sm },
  appName: { fontSize: FONT_SIZES.title, fontFamily: FONTS.bold, color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  faceContainer: { alignItems: 'center', marginTop: SPACING.sm, marginBottom: -SPACING.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.subtitle, fontFamily: FONTS.semibold, color: '#fff', marginTop: SPACING.lg },
  errorText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.medium, color: '#fff', textAlign: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl },
});
