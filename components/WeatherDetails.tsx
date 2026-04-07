import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Line, Path, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
import type { CurrentWeather, AirQuality } from '../utils/weatherApi';

interface Props {
  current: CurrentWeather;
  airQuality: AirQuality | null;
  unit: 'metric' | 'imperial';
}

export default function WeatherDetails({ current, airQuality, unit }: Props) {
  const sunrise = formatTime(current.sunrise);
  const sunset = formatTime(current.sunset);
  const visibilityVal = unit === 'imperial'
    ? `${(current.visibility / 1609.34).toFixed(1)} mi`
    : `${(current.visibility / 1000).toFixed(1)} km`;

  return (
    <View style={s.container}>
      {/* Row 1: Air Quality + Feels Like */}
      <View style={s.row}>
        {airQuality && <AirQualityCard aq={airQuality} />}
        <FeelsLikeCard feelsLike={current.feelsLike} temp={current.temp} unit={unit} />
      </View>

      {/* Row 2: Sunrise/Sunset + UV Index */}
      <View style={s.row}>
        <SunCard sunrise={sunrise} sunset={sunset} sunriseTs={current.sunrise} sunsetTs={current.sunset} />
        <UVIndexCard conditionCode={current.conditionCode} isNight={current.isNight} clouds={current.clouds} />
      </View>

      {/* Row 3: Visibility + Pressure */}
      <View style={s.row}>
        <DetailCard title="VISIBILITY" value={visibilityVal} subtitle={getVisibilityLabel(current.visibility)} />
        <DetailCard title="PRESSURE" value={`${current.pressure}`} subtitle="hPa" />
      </View>
    </View>
  );
}

// ── Air Quality Card ─────────────────────────────────────

function AirQualityCard({ aq }: { aq: AirQuality }) {
  // EPA scale: 0-500, but most readings are 0-200
  const dotPosition = Math.min((aq.aqi / 300) * 100, 100);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>AIR QUALITY</Text>
      <Text style={s.bigValue}>{aq.aqi}</Text>
      <Text style={s.cardLabel}>{aq.aqiLabel}</Text>
      {/* Color bar */}
      <View style={s.aqiBarWrap}>
        <Svg width="100%" height={12} viewBox="0 0 200 12">
          <Defs>
            <SvgGrad id="aqGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#4ECB71" />
              <Stop offset="17%" stopColor="#A8D84E" />
              <Stop offset="33%" stopColor="#FFD93D" />
              <Stop offset="50%" stopColor="#FF9F43" />
              <Stop offset="67%" stopColor="#FF5252" />
              <Stop offset="100%" stopColor="#8B0000" />
            </SvgGrad>
          </Defs>
          <Rect x={0} y={2} width={200} height={8} rx={4} fill="url(#aqGrad)" />
          <Circle cx={Math.max(5, Math.min(dotPosition * 2, 195))} cy={6} r={5} fill="#fff" stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
        </Svg>
      </View>
      <View style={s.aqiDetails}>
        <Text style={s.aqiStat}>PM2.5: {aq.pm2_5}</Text>
        <Text style={s.aqiStat}>O₃: {aq.o3}</Text>
        <Text style={s.aqiStat}>NO₂: {aq.no2}</Text>
      </View>
    </View>
  );
}

// ── Feels Like Card ──────────────────────────────────────

function FeelsLikeCard({ feelsLike, temp, unit }: { feelsLike: number; temp: number; unit: string }) {
  const diff = feelsLike - temp;
  let description: string;
  if (Math.abs(diff) <= 2) description = 'Similar to actual temperature';
  else if (diff > 0) description = `Humidity makes it feel warmer`;
  else description = `Wind makes it feel cooler`;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>FEELS LIKE</Text>
      <Text style={s.bigValue}>{feelsLike}°</Text>
      <Text style={s.cardSubtitle}>{description}</Text>
    </View>
  );
}

// ── Sunrise / Sunset Card ────────────────────────────────

function SunCard({ sunrise, sunset, sunriseTs, sunsetTs }: {
  sunrise: string; sunset: string; sunriseTs: number; sunsetTs: number;
}) {
  const now = Date.now() / 1000;
  const dayLength = sunsetTs - sunriseTs;
  const elapsed = Math.max(0, Math.min(now - sunriseTs, dayLength));
  const progress = dayLength > 0 ? elapsed / dayLength : 0;
  const isDay = now >= sunriseTs && now <= sunsetTs;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>SUNRISE & SUNSET</Text>
      {/* Sun arc */}
      <View style={s.sunArcWrap}>
        <Svg width="100%" height={60} viewBox="0 0 140 60">
          {/* Arc path */}
          <Path d="M10,55 Q70,-10 130,55" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />
          {/* Horizon line */}
          <Line x1={10} y1={55} x2={130} y2={55} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          {/* Sun dot on arc */}
          {isDay && (() => {
            const t = progress;
            const x = 10 + t * 120;
            const y = 55 - Math.sin(t * Math.PI) * 65;
            return <Circle cx={x} cy={Math.max(y, 2)} r={5} fill="#FFD93D" />;
          })()}
        </Svg>
      </View>
      <View style={s.sunTimes}>
        <View>
          <Text style={s.sunLabel}>Sunrise</Text>
          <Text style={s.sunTime}>{sunrise}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.sunLabel}>Sunset</Text>
          <Text style={s.sunTime}>{sunset}</Text>
        </View>
      </View>
    </View>
  );
}

// ── UV Index Card ────────────────────────────────────────

function UVIndexCard({ conditionCode, isNight, clouds }: { conditionCode: number; isNight: boolean; clouds: number }) {
  // Estimate UV from conditions (real UV needs One Call API)
  let uvi: number;
  if (isNight) uvi = 0;
  else if (conditionCode >= 200 && conditionCode < 700) uvi = 1; // precipitation
  else if (clouds > 80) uvi = 2;
  else if (clouds > 50) uvi = 4;
  else if (clouds > 20) uvi = 6;
  else uvi = 7;

  const { label, color } = getUVInfo(uvi);
  const barWidth = Math.min((uvi / 11) * 100, 100);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>UV INDEX</Text>
      <Text style={[s.bigValue, { color }]}>{uvi}</Text>
      <Text style={s.cardLabel}>{label}</Text>
      <View style={s.uvBar}>
        <View style={[s.uvBarFill, { width: `${barWidth}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.cardSubtitle}>{getUVAdvice(uvi)}</Text>
    </View>
  );
}

// ── Generic Detail Card ──────────────────────────────────

function DetailCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.bigValue}>{value}</Text>
      <Text style={s.cardSubtitle}>{subtitle}</Text>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getVisibilityLabel(m: number): string {
  if (m >= 10000) return 'Perfectly clear';
  if (m >= 5000) return 'Good visibility';
  if (m >= 2000) return 'Moderate';
  if (m >= 1000) return 'Poor visibility';
  return 'Very poor';
}

function getUVInfo(uvi: number) {
  if (uvi <= 2) return { label: 'Low', color: '#4ECB71' };
  if (uvi <= 5) return { label: 'Moderate', color: '#FFD93D' };
  if (uvi <= 7) return { label: 'High', color: '#FF9F43' };
  if (uvi <= 10) return { label: 'Very High', color: '#FF5252' };
  return { label: 'Extreme', color: '#9B59B6' };
}

function getUVAdvice(uvi: number): string {
  if (uvi <= 2) return 'No protection needed';
  if (uvi <= 5) return 'Wear sunscreen';
  if (uvi <= 7) return 'Seek shade midday';
  return 'Avoid sun exposure';
}

// ── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { marginHorizontal: SPACING.lg, marginTop: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  bigValue: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: '#fff',
    lineHeight: 34,
  },
  cardLabel: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.semibold,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.micro,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.5)',
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
  // AQI
  aqiBarWrap: { marginTop: SPACING.sm, marginBottom: SPACING.xs },
  aqiDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  aqiStat: { fontSize: 10, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.45)' },
  // Sun
  sunArcWrap: { marginVertical: SPACING.xs, alignItems: 'center' },
  sunTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  sunLabel: { fontSize: 10, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.45)' },
  sunTime: { fontSize: FONT_SIZES.body, fontFamily: FONTS.bold, color: '#fff', marginTop: 2 },
  // UV
  uvBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: SPACING.sm, overflow: 'hidden' },
  uvBarFill: { height: 4, borderRadius: 2 },
});
