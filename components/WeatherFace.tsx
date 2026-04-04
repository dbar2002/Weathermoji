import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { getWeatherMeta, getCloudMood, type CloudMood } from '../utils/weatherMeta';

interface WeatherFaceProps {
  temp: number;
  conditionCode: number;
  isNight?: boolean;
  size?: number;
}

export default function WeatherFace({ temp, conditionCode, isNight = false, size = 88 }: WeatherFaceProps) {
  const meta = getWeatherMeta(conditionCode, isNight);
  if (meta.type === 'rain' || meta.type === 'storm' || meta.type === 'snow') {
    return <CloudFace temp={temp} mood={getCloudMood(conditionCode)} size={size} />;
  }
  if (meta.type === 'cloudy' || meta.type === 'mist') {
    return <CloudFace temp={temp} mood="neutral" size={size} />;
  }
  if (isNight) return <MoonFace temp={temp} size={size} />;
  return <SunFace temp={temp} size={size} />;
}

// ── Sun Face ─────────────────────────────────────────────

function SunFace({ temp, size }: { temp: number; size: number }) {
  let eyes: string, mouth: string, cheeks = false, sweat = false;

  if (temp >= 40)      { eyes = 'x';       mouth = 'wavy';       cheeks = true; sweat = true; }
  else if (temp >= 35) { eyes = 'squint';  mouth = 'open-frown'; cheeks = true; sweat = true; }
  else if (temp >= 30) { eyes = 'shades';  mouth = 'smirk'; }
  else if (temp >= 25) { eyes = 'happy';   mouth = 'big-smile';  cheeks = true; }
  else if (temp >= 20) { eyes = 'normal';  mouth = 'smile'; }
  else if (temp >= 15) { eyes = 'normal';  mouth = 'small-smile'; }
  else if (temp >= 10) { eyes = 'wide';    mouth = 'wavy'; }
  else if (temp >= 5)  { eyes = 'wide';    mouth = 'chatter';    cheeks = true; }
  else                 { eyes = 'x';       mouth = 'open-frown'; cheeks = true; }

  const r = size / 2, cx = r, cy = r;
  const dk = '#5C3D1A';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Rays */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <Line key={i}
              x1={cx + Math.cos(a) * r * 0.78} y1={cy + Math.sin(a) * r * 0.78}
              x2={cx + Math.cos(a) * r * 0.95} y2={cy + Math.sin(a) * r * 0.95}
              stroke="#F5A623" strokeWidth={2.5} strokeLinecap="round" opacity={0.6}
            />
          );
        })}
        <Circle cx={cx} cy={cy} r={r * 0.62} fill="#FFD93D" />
        <Circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke="#F5A623" strokeWidth={1.5} opacity={0.3} />
        {cheeks && (
          <>
            <Circle cx={cx - r * 0.28} cy={cy + r * 0.12} r={r * 0.1} fill="#FF9F43" opacity={0.35} />
            <Circle cx={cx + r * 0.28} cy={cy + r * 0.12} r={r * 0.1} fill="#FF9F43" opacity={0.35} />
          </>
        )}
        <EyesSvg type={eyes} cx={cx} cy={cy} r={r} dark={dk} />
        <MouthSvg type={mouth} cx={cx} cy={cy} r={r} dark={dk} />
        {sweat && (
          <Path d={`M${cx + r * 0.35},${cy - r * 0.12}Q${cx + r * 0.38},${cy + r * 0.02} ${cx + r * 0.32},${cy + r * 0.05}Q${cx + r * 0.28},${cy + r * 0.01} ${cx + r * 0.35},${cy - r * 0.12}`}
            fill="#6EC6FF" opacity={0.7} />
        )}
      </Svg>
    </View>
  );
}

// ── Moon Face ────────────────────────────────────────────

function MoonFace({ temp, size }: { temp: number; size: number }) {
  let eyes: string, mouth: string, cheeks = false;

  if (temp >= 25)      { eyes = 'happy';  mouth = 'smile';       cheeks = true; }
  else if (temp >= 18) { eyes = 'sleepy'; mouth = 'small-smile'; }
  else if (temp >= 10) { eyes = 'normal'; mouth = 'neutral'; }
  else if (temp >= 3)  { eyes = 'wide';   mouth = 'wavy';        cheeks = true; }
  else                 { eyes = 'x';      mouth = 'open-frown';  cheeks = true; }

  const r = size / 2, cx = r, cy = r;
  const dk = '#5C4B1A';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={r * 0.55} fill="#F0E68C" />
        <Circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#D4C652" strokeWidth={1} opacity={0.3} />
        <Circle cx={cx - r * 0.15} cy={cy + r * 0.15} r={r * 0.06} fill="#E0D45C" opacity={0.5} />
        <Circle cx={cx + r * 0.1} cy={cy - r * 0.2} r={r * 0.04} fill="#E0D45C" opacity={0.4} />
        {cheeks && (
          <>
            <Circle cx={cx - r * 0.25} cy={cy + r * 0.1} r={r * 0.08} fill="#E8C84A" opacity={0.4} />
            <Circle cx={cx + r * 0.25} cy={cy + r * 0.1} r={r * 0.08} fill="#E8C84A" opacity={0.4} />
          </>
        )}
        <EyesSvg type={eyes} cx={cx} cy={cy} r={r} dark={dk} />
        <MouthSvg type={mouth} cx={cx} cy={cy} r={r} dark={dk} />
      </Svg>
    </View>
  );
}

// ── Cloud Face ───────────────────────────────────────────

function CloudFace({ temp, mood, size }: { temp: number; mood: CloudMood; size: number }) {
  let eyes: string, mouth: string, cheeks = false, brows = false;

  if (mood === 'storm')          { eyes = 'angry';  mouth = 'grr';         brows = true; }
  else if (mood === 'heavy-rain'){ eyes = 'crying'; mouth = 'frown'; }
  else if (mood === 'rain')      { eyes = 'sad';    mouth = 'pout'; }
  else if (mood === 'snow')      { eyes = 'sleepy'; mouth = 'small-smile'; cheeks = true; }
  else if (temp >= 25)           { eyes = 'normal'; mouth = 'small-smile'; }
  else if (temp >= 15)           { eyes = 'normal'; mouth = 'neutral'; }
  else                           { eyes = 'wide';   mouth = 'wavy'; }

  const r = size / 2, cx = r, cy = r;
  const cyo = cy + r * 0.05;
  const dk = mood === 'storm' ? '#1A202C' : '#4A5568';
  const cFill = mood === 'storm' ? '#4A5568' : mood === 'rain' || mood === 'heavy-rain' ? '#7A96AD' : mood === 'snow' ? '#C8DCF0' : '#B8C9D9';
  const cTop = mood === 'storm' ? '#5C6B7A' : mood === 'rain' || mood === 'heavy-rain' ? '#8BA3B8' : mood === 'snow' ? '#D6E4F7' : '#C8D6E5';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Cloud shape */}
        <Ellipse cx={cx - r * 0.25} cy={cyo - r * 0.22} rx={r * 0.39} ry={r * 0.32} fill={cTop} />
        <Ellipse cx={cx + r * 0.15} cy={cyo - r * 0.18} rx={r * 0.36} ry={r * 0.3} fill={cTop} />
        <Ellipse cx={cx} cy={cyo + r * 0.08} rx={r * 0.62} ry={r * 0.32} fill={cFill} />

        {cheeks && (
          <>
            <Circle cx={cx - r * 0.28} cy={cyo + r * 0.12} r={r * 0.08} fill={mood === 'snow' ? '#A8C0E0' : '#7A96AD'} opacity={0.3} />
            <Circle cx={cx + r * 0.28} cy={cyo + r * 0.12} r={r * 0.08} fill={mood === 'snow' ? '#A8C0E0' : '#7A96AD'} opacity={0.3} />
          </>
        )}
        {brows && (
          <>
            <Line x1={cx - r * 0.24} y1={cyo - r * 0.18} x2={cx - r * 0.1} y2={cyo - r * 0.12} stroke="#2C3A47" strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={cx + r * 0.24} y1={cyo - r * 0.18} x2={cx + r * 0.1} y2={cyo - r * 0.12} stroke="#2C3A47" strokeWidth={2.5} strokeLinecap="round" />
          </>
        )}

        {/* Cloud-specific eyes */}
        {eyes === 'sad' && (
          <>
            <Circle cx={cx - r * 0.15} cy={cyo - r * 0.02} r={r * 0.05} fill="#4A6B8A" />
            <Circle cx={cx + r * 0.15} cy={cyo - r * 0.02} r={r * 0.05} fill="#4A6B8A" />
            <Circle cx={cx - r * 0.14} cy={cyo - r * 0.035} r={r * 0.018} fill="#fff" opacity={0.7} />
            <Circle cx={cx + r * 0.14} cy={cyo - r * 0.035} r={r * 0.018} fill="#fff" opacity={0.7} />
            <Path d={`M${cx - r * 0.21},${cyo - r * 0.1}Q${cx - r * 0.15},${cyo - r * 0.16} ${cx - r * 0.09},${cyo - r * 0.1}`} fill="none" stroke="#4A6B8A" strokeWidth={1.5} strokeLinecap="round" />
            <Path d={`M${cx + r * 0.09},${cyo - r * 0.1}Q${cx + r * 0.15},${cyo - r * 0.16} ${cx + r * 0.21},${cyo - r * 0.1}`} fill="none" stroke="#4A6B8A" strokeWidth={1.5} strokeLinecap="round" />
          </>
        )}
        {eyes === 'crying' && (
          <>
            <Circle cx={cx - r * 0.15} cy={cyo - r * 0.02} r={r * 0.055} fill="#4A6B8A" />
            <Circle cx={cx + r * 0.15} cy={cyo - r * 0.02} r={r * 0.055} fill="#4A6B8A" />
            <Circle cx={cx - r * 0.14} cy={cyo - r * 0.035} r={r * 0.02} fill="#fff" opacity={0.8} />
            <Circle cx={cx + r * 0.14} cy={cyo - r * 0.035} r={r * 0.02} fill="#fff" opacity={0.8} />
            <Path d={`M${cx - r * 0.15},${cyo + r * 0.04}Q${cx - r * 0.16},${cyo + r * 0.18} ${cx - r * 0.13},${cyo + r * 0.22}`} fill="none" stroke="#6EC6FF" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
            <Path d={`M${cx + r * 0.15},${cyo + r * 0.04}Q${cx + r * 0.16},${cyo + r * 0.2} ${cx + r * 0.13},${cyo + r * 0.24}`} fill="none" stroke="#6EC6FF" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          </>
        )}
        {eyes === 'angry' && (
          <>
            <Circle cx={cx - r * 0.15} cy={cyo - r * 0.02} r={r * 0.05} fill="#1A202C" />
            <Circle cx={cx + r * 0.15} cy={cyo - r * 0.02} r={r * 0.05} fill="#1A202C" />
            <Circle cx={cx - r * 0.14} cy={cyo - r * 0.03} r={r * 0.015} fill="#C53030" opacity={0.8} />
            <Circle cx={cx + r * 0.14} cy={cyo - r * 0.03} r={r * 0.015} fill="#C53030" opacity={0.8} />
          </>
        )}
        {eyes === 'sleepy' && (
          <>
            <Path d={`M${cx - r * 0.2},${cyo}Q${cx - r * 0.15},${cyo - r * 0.08} ${cx - r * 0.1},${cyo}`} fill="none" stroke={mood === 'snow' ? '#6B84A3' : dk} strokeWidth={2} strokeLinecap="round" />
            <Path d={`M${cx + r * 0.1},${cyo}Q${cx + r * 0.15},${cyo - r * 0.08} ${cx + r * 0.2},${cyo}`} fill="none" stroke={mood === 'snow' ? '#6B84A3' : dk} strokeWidth={2} strokeLinecap="round" />
          </>
        )}
        {(eyes === 'normal' || eyes === 'wide') && (
          <EyesSvg type={eyes} cx={cx} cy={cyo} r={r} dark={dk} />
        )}

        <MouthSvg type={mouth} cx={cx} cy={cyo} r={r} dark={dk} />

        {/* Rain drops */}
        {(mood === 'rain' || mood === 'heavy-rain') && (
          <>
            {[-0.2, 0, 0.2].map((dx, i) => (
              <Line key={`r${i}`} x1={cx + r * dx} y1={cy + r * 0.42} x2={cx + r * dx - r * 0.04} y2={cy + r * 0.52}
                stroke="#6EC6FF" strokeWidth={1.8} strokeLinecap="round" opacity={0.5} />
            ))}
          </>
        )}
        {mood === 'heavy-rain' && [-0.3, -0.1, 0.1, 0.3].map((dx, i) => (
          <Line key={`hr${i}`} x1={cx + r * dx} y1={cy + r * 0.46} x2={cx + r * dx - r * 0.04} y2={cy + r * 0.56}
            stroke="#4A90D9" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
        ))}

        {/* Lightning */}
        {mood === 'storm' && (
          <>
            <Path d={`M${cx - r * 0.05},${cy + r * 0.38}L${cx + r * 0.04},${cy + r * 0.48}L${cx - r * 0.02},${cy + r * 0.48}L${cx + r * 0.06},${cy + r * 0.58}`}
              fill="none" stroke="#FFD93D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {[-0.25, 0.18].map((dx, i) => (
              <Line key={`sl${i}`} x1={cx + r * dx} y1={cy + r * 0.42} x2={cx + r * dx - r * 0.03} y2={cy + r * 0.52}
                stroke="#8BA3B8" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
            ))}
          </>
        )}

        {/* Snowflakes */}
        {mood === 'snow' && [-0.2, 0, 0.2, -0.1, 0.1].map((dx, i) => (
          <SvgText key={`sn${i}`} x={cx + r * dx} y={cy + r * (0.44 + (i % 2) * 0.08)}
            fontSize={size * 0.1} fill="#8BA3B8" textAnchor="middle" opacity={0.5}>*</SvgText>
        ))}
      </Svg>
    </View>
  );
}

// ── Shared Eye Primitives ────────────────────────────────

function EyesSvg({ type, cx, cy, r, dark }: { type: string; cx: number; cy: number; r: number; dark: string }) {
  if (type === 'normal') return (
    <>
      <Circle cx={cx - r * 0.17} cy={cy - r * 0.08} r={r * 0.055} fill={dark} />
      <Circle cx={cx + r * 0.17} cy={cy - r * 0.08} r={r * 0.055} fill={dark} />
      <Circle cx={cx - r * 0.155} cy={cy - r * 0.095} r={r * 0.02} fill="#fff" />
      <Circle cx={cx + r * 0.155} cy={cy - r * 0.095} r={r * 0.02} fill="#fff" />
    </>
  );
  if (type === 'happy') return (
    <>
      <Path d={`M${cx - r * 0.23},${cy - r * 0.06}Q${cx - r * 0.17},${cy - r * 0.18} ${cx - r * 0.11},${cy - r * 0.06}`} fill="none" stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
      <Path d={`M${cx + r * 0.11},${cy - r * 0.06}Q${cx + r * 0.17},${cy - r * 0.18} ${cx + r * 0.23},${cy - r * 0.06}`} fill="none" stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
  if (type === 'shades') return (
    <>
      <Rect x={cx - r * 0.32} y={cy - r * 0.18} width={r * 0.26} height={r * 0.18} rx={3} fill="#2C1810" />
      <Rect x={cx + r * 0.06} y={cy - r * 0.18} width={r * 0.26} height={r * 0.18} rx={3} fill="#2C1810" />
      <Line x1={cx - r * 0.06} y1={cy - r * 0.1} x2={cx + r * 0.06} y2={cy - r * 0.1} stroke="#2C1810" strokeWidth={2} />
      <Line x1={cx - r * 0.32} y1={cy - r * 0.1} x2={cx - r * 0.42} y2={cy - r * 0.14} stroke="#2C1810" strokeWidth={2} />
      <Line x1={cx + r * 0.32} y1={cy - r * 0.1} x2={cx + r * 0.42} y2={cy - r * 0.14} stroke="#2C1810" strokeWidth={2} />
    </>
  );
  if (type === 'wide') return (
    <>
      <Circle cx={cx - r * 0.17} cy={cy - r * 0.08} r={r * 0.08} fill="#fff" stroke={dark} strokeWidth={1.5} />
      <Circle cx={cx + r * 0.17} cy={cy - r * 0.08} r={r * 0.08} fill="#fff" stroke={dark} strokeWidth={1.5} />
      <Circle cx={cx - r * 0.16} cy={cy - r * 0.07} r={r * 0.04} fill={dark} />
      <Circle cx={cx + r * 0.16} cy={cy - r * 0.07} r={r * 0.04} fill={dark} />
    </>
  );
  if (type === 'squint') return (
    <>
      <Line x1={cx - r * 0.23} y1={cy - r * 0.08} x2={cx - r * 0.11} y2={cy - r * 0.08} stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={cx + r * 0.11} y1={cy - r * 0.08} x2={cx + r * 0.23} y2={cy - r * 0.08} stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
  if (type === 'sleepy') return (
    <>
      <Path d={`M${cx - r * 0.22},${cy - r * 0.06}Q${cx - r * 0.16},${cy - r * 0.12} ${cx - r * 0.1},${cy - r * 0.06}`} fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M${cx + r * 0.1},${cy - r * 0.06}Q${cx + r * 0.16},${cy - r * 0.12} ${cx + r * 0.22},${cy - r * 0.06}`} fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round" />
    </>
  );
  if (type === 'x') return (
    <>
      <Line x1={cx - r * 0.22} y1={cy - r * 0.14} x2={cx - r * 0.12} y2={cy - r * 0.04} stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={cx - r * 0.12} y1={cy - r * 0.14} x2={cx - r * 0.22} y2={cy - r * 0.04} stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={cx + r * 0.12} y1={cy - r * 0.14} x2={cx + r * 0.22} y2={cy - r * 0.04} stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={cx + r * 0.22} y1={cy - r * 0.14} x2={cx + r * 0.12} y2={cy - r * 0.04} stroke={dark} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
  return null;
}

// ── Shared Mouth Primitives ──────────────────────────────

function MouthSvg({ type, cx, cy, r, dark }: { type: string; cx: number; cy: number; r: number; dark: string }) {
  if (type === 'big-smile') return <Path d={`M${cx - r * 0.2},${cy + r * 0.1}Q${cx},${cy + r * 0.32} ${cx + r * 0.2},${cy + r * 0.1}`} fill="#E8903A" stroke={dark} strokeWidth={1.5} />;
  if (type === 'smile') return <Path d={`M${cx - r * 0.15},${cy + r * 0.12}Q${cx},${cy + r * 0.24} ${cx + r * 0.15},${cy + r * 0.12}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />;
  if (type === 'small-smile') return <Path d={`M${cx - r * 0.1},${cy + r * 0.14}Q${cx},${cy + r * 0.22} ${cx + r * 0.1},${cy + r * 0.14}`} fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round" />;
  if (type === 'smirk') return <Path d={`M${cx - r * 0.08},${cy + r * 0.14}Q${cx + r * 0.05},${cy + r * 0.22} ${cx + r * 0.18},${cy + r * 0.1}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />;
  if (type === 'neutral') return <Line x1={cx - r * 0.08} y1={cy + r * 0.14} x2={cx + r * 0.08} y2={cy + r * 0.14} stroke={dark} strokeWidth={2} strokeLinecap="round" />;
  if (type === 'wavy') return <Path d={`M${cx - r * 0.15},${cy + r * 0.14}Q${cx - r * 0.05},${cy + r * 0.08} ${cx},${cy + r * 0.14}Q${cx + r * 0.05},${cy + r * 0.2} ${cx + r * 0.15},${cy + r * 0.14}`} fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round" />;
  if (type === 'open-frown') return <Ellipse cx={cx} cy={cy + r * 0.18} rx={r * 0.1} ry={r * 0.08} fill={dark} />;
  if (type === 'chatter') return (
    <>
      <Rect x={cx - r * 0.12} y={cy + r * 0.1} width={r * 0.24} height={r * 0.04} rx={2} fill={dark} />
      <Rect x={cx - r * 0.1} y={cy + r * 0.17} width={r * 0.2} height={r * 0.035} rx={2} fill={dark} />
    </>
  );
  if (type === 'pout') return <Path d={`M${cx - r * 0.12},${cy + r * 0.18}Q${cx},${cy + r * 0.1} ${cx + r * 0.12},${cy + r * 0.18}`} fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round" />;
  if (type === 'frown') return <Path d={`M${cx - r * 0.15},${cy + r * 0.2}Q${cx},${cy + r * 0.1} ${cx + r * 0.15},${cy + r * 0.2}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />;
  if (type === 'grr') return (
    <>
      <Path d={`M${cx - r * 0.13},${cy + r * 0.17}Q${cx},${cy + r * 0.08} ${cx + r * 0.13},${cy + r * 0.17}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={cx - r * 0.08} y1={cy + r * 0.14} x2={cx - r * 0.04} y2={cy + r * 0.11} stroke={dark} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={cx + r * 0.08} y1={cy + r * 0.14} x2={cx + r * 0.04} y2={cy + r * 0.11} stroke={dark} strokeWidth={1.5} strokeLinecap="round" />
    </>
  );
  return null;
}
