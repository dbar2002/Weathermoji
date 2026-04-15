import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle, Ellipse, Line, Path, Rect, G, Defs, Stop,
  RadialGradient, Filter, FeGaussianBlur, FeOffset,
  FeComposite, FeFlood, FeMerge, FeMergeNode, FeDropShadow,
  Text as SvgText,
} from 'react-native-svg';
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
    return <CloudFace temp={temp} mood={getCloudMood(conditionCode)} size={size} isNight={isNight} />;
  }
  if (meta.type === 'cloudy' || meta.type === 'mist') {
    return <CloudFace temp={temp} mood="neutral" size={size} isNight={isNight} />;
  }
  if (isNight) return <MoonFace temp={temp} size={size} />;
  return <SunFace temp={temp} size={size} />;
}

// ── 3D Sun Face ──────────────────────────────────────────

function SunFace({ temp, size }: { temp: number; size: number }) {
  let eyes: string, mouth: string, cheeks = false, sweat = false, heat = false, freckles = false;

  if (temp >= 38)      { eyes = 'x';       mouth = 'wavy';       cheeks = true; sweat = true; heat = true; }
  else if (temp >= 32) { eyes = 'squint';  mouth = 'open-frown'; cheeks = true; sweat = true; heat = true; }
  else if (temp >= 26) { eyes = 'shades';  mouth = 'smirk';      freckles = true; }
  else if (temp >= 21) { eyes = 'happy';   mouth = 'big-smile';  cheeks = true; freckles = true; }
  else if (temp >= 16) { eyes = 'normal';  mouth = 'smile';      freckles = true; }
  else if (temp >= 10) { eyes = 'normal';  mouth = 'small-smile'; }
  else if (temp >= 4)  { eyes = 'wide';    mouth = 'wavy'; }
  else if (temp >= -1) { eyes = 'wide';    mouth = 'chatter';    cheeks = true; }
  else                 { eyes = 'x';       mouth = 'open-frown'; cheeks = true; }

  const r = size / 2, cx = r, cy = r;
  const dk = '#6B4420';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* 3D sphere gradient — lit from top-left */}
          <RadialGradient id="s-body" cx="40%" cy="35%" r="60%">
            <Stop offset="0%" stopColor="#FFE97A" />
            <Stop offset="60%" stopColor="#FFD93D" />
            <Stop offset="100%" stopColor="#F0B020" />
          </RadialGradient>
          {/* Ambient glow */}
          <RadialGradient id="s-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFD93D" stopOpacity="0.35" />
            <Stop offset="70%" stopColor="#FFD93D" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#FFD93D" stopOpacity="0" />
          </RadialGradient>
          {/* Cheek blush */}
          <RadialGradient id="s-ck" cx="50%" cy="40%">
            <Stop offset="0%" stopColor="#FF8844" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#FF8844" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Glow aura */}
        <Circle cx={cx} cy={cy} r={r * 0.95} fill="url(#s-glow)" />
        {/* Rays — alternating long/short */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const lo = i % 2 === 0;
          return (
            <Line key={i}
              x1={cx + Math.cos(a) * r * (lo ? 0.7 : 0.74)}
              y1={cy + Math.sin(a) * r * (lo ? 0.7 : 0.74)}
              x2={cx + Math.cos(a) * r * (lo ? 0.94 : 0.88)}
              y2={cy + Math.sin(a) * r * (lo ? 0.94 : 0.88)}
              stroke={lo ? '#F5B030' : '#FFD060'} strokeWidth={lo ? 3.5 : 2} strokeLinecap="round" opacity={lo ? 0.55 : 0.3}
            />
          );
        })}
        {/* 3D body sphere */}
        <Circle cx={cx} cy={cy} r={r * 0.6} fill="url(#s-body)" />
        {/* Inner shadow — bottom edge for 3D depth */}
        <Path
          d={`M${cx - r * 0.5},${cy + r * 0.2}A${r * 0.6},${r * 0.6} 0 0,0 ${cx + r * 0.5},${cy + r * 0.2}`}
          fill="none" stroke="#C08020" strokeWidth={r * 0.04} opacity={0.15}
        />
        {/* Specular highlight — top left */}
        <Ellipse cx={cx - r * 0.15} cy={cy - r * 0.2} rx={r * 0.25} ry={r * 0.18} fill="#fff" opacity={0.35} />
        <Ellipse cx={cx - r * 0.12} cy={cy - r * 0.22} rx={r * 0.12} ry={r * 0.08} fill="#fff" opacity={0.25} />
        {/* Bottom rim light */}
        <Ellipse cx={cx + r * 0.05} cy={cy + r * 0.35} rx={r * 0.3} ry={r * 0.08} fill="#F0A010" opacity={0.2} />
        {/* Heat waves */}
        {heat && (
          <>
            <Path d={`M${cx - r * 0.38},${cy - r * 0.72}Q${cx - r * 0.33},${cy - r * 0.84} ${cx - r * 0.28},${cy - r * 0.72}Q${cx - r * 0.23},${cy - r * 0.62} ${cx - r * 0.18},${cy - r * 0.72}`}
              fill="none" stroke="#FF6B35" strokeWidth={1.8} strokeLinecap="round" opacity={0.3} />
            <Path d={`M${cx + r * 0.2},${cy - r * 0.78}Q${cx + r * 0.25},${cy - r * 0.9} ${cx + r * 0.3},${cy - r * 0.78}Q${cx + r * 0.35},${cy - r * 0.68} ${cx + r * 0.4},${cy - r * 0.78}`}
              fill="none" stroke="#FF6B35" strokeWidth={1.8} strokeLinecap="round" opacity={0.25} />
          </>
        )}
        {/* Blush cheeks */}
        {cheeks && (
          <>
            <Circle cx={cx - r * 0.3} cy={cy + r * 0.1} r={r * 0.13} fill="url(#s-ck)" />
            <Circle cx={cx + r * 0.3} cy={cy + r * 0.1} r={r * 0.13} fill="url(#s-ck)" />
          </>
        )}
        {/* Freckles */}
        {freckles && (
          <>
            {[[-0.2, 0.03], [-0.16, 0.07], [-0.23, 0.07], [0.2, 0.03], [0.16, 0.07], [0.23, 0.07]].map(([dx, dy], i) => (
              <Circle key={i} cx={cx + r * dx} cy={cy + r * dy} r={r * 0.01} fill="#C08030" opacity={0.25} />
            ))}
          </>
        )}
        {/* Nose */}
        <Path d={`M${cx - r * 0.015},${cy + r * 0.03}Q${cx},${cy} ${cx + r * 0.015},${cy + r * 0.03}`}
          fill="none" stroke={dk} strokeWidth={1} strokeLinecap="round" opacity={0.18} />
        {/* Features */}
        <EyesSvg type={eyes} cx={cx} cy={cy} r={r} dark={dk} />
        <MouthSvg type={mouth} cx={cx} cy={cy} r={r} dark={dk} />
        {/* Sweat */}
        {sweat && (
          <Path d={`M${cx + r * 0.34},${cy - r * 0.14}C${cx + r * 0.37},${cy - r * 0.04} ${cx + r * 0.33},${cy + r * 0.02} ${cx + r * 0.3},${cy + r * 0.05}C${cx + r * 0.27},${cy + r * 0.01} ${cx + r * 0.32},${cy - r * 0.07} ${cx + r * 0.34},${cy - r * 0.14}Z`}
            fill="#6EC6FF" opacity={0.65} />
        )}
        {/* Scarf for sub-zero */}
        {temp < 0 && (
          <>
            <Path d={`M${cx - r * 0.42},${cy + r * 0.3}Q${cx},${cy + r * 0.42} ${cx + r * 0.42},${cy + r * 0.3}`}
              fill="none" stroke="#D94040" strokeWidth={r * 0.07} strokeLinecap="round" opacity={0.55} />
            <Path d={`M${cx + r * 0.38},${cy + r * 0.31}L${cx + r * 0.4},${cy + r * 0.46}L${cx + r * 0.46},${cy + r * 0.44}`}
              fill="none" stroke="#D94040" strokeWidth={r * 0.045} strokeLinecap="round" opacity={0.45} />
          </>
        )}
      </Svg>
    </View>
  );
}

// ── 3D Moon Face ─────────────────────────────────────────

function MoonFace({ temp, size }: { temp: number; size: number }) {
  let eyes: string, mouth: string, cheeks = false, zzz = false;

  if (temp >= 21)      { eyes = 'happy';  mouth = 'smile';       cheeks = true; }
  else if (temp >= 14) { eyes = 'sleepy'; mouth = 'small-smile'; zzz = true; }
  else if (temp >= 7)  { eyes = 'sleepy'; mouth = 'neutral';     zzz = true; }
  else if (temp >= 0)  { eyes = 'wide';   mouth = 'wavy';        cheeks = true; }
  else                 { eyes = 'x';      mouth = 'open-frown';  cheeks = true; }

  const r = size / 2, cx = r, cy = r;
  const dk = '#4A4070';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="m-body" cx="38%" cy="32%" r="62%">
            <Stop offset="0%" stopColor="#FFF8D6" />
            <Stop offset="50%" stopColor="#F5E6A3" />
            <Stop offset="100%" stopColor="#D8C878" />
          </RadialGradient>
          <RadialGradient id="m-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F5E6A3" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#F5E6A3" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="m-ck">
            <Stop offset="0%" stopColor="#E8C84A" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#E8C84A" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r * 0.85} fill="url(#m-glow)" />
        {/* Stars with depth */}
        {[[-0.75, -0.55, 0.025], [0.7, -0.65, 0.03], [-0.6, 0.6, 0.02], [0.8, 0.35, 0.025], [0.3, -0.8, 0.02], [-0.82, 0.15, 0.015], [0.55, -0.45, 0.018]].map(([dx, dy, s], i) => (
          <Circle key={i} cx={cx + r * dx} cy={cy + r * dy} r={r * s} fill="#fff" opacity={0.5} />
        ))}
        {/* 3D Moon body */}
        <Circle cx={cx} cy={cy} r={r * 0.53} fill="url(#m-body)" />
        {/* Inner shadow arc */}
        <Path d={`M${cx - r * 0.42},${cy + r * 0.18}A${r * 0.53},${r * 0.53} 0 0,0 ${cx + r * 0.42},${cy + r * 0.18}`}
          fill="none" stroke="#A09040" strokeWidth={r * 0.03} opacity={0.12} />
        {/* Crescent shadow */}
        <Circle cx={cx + r * 0.2} cy={cy - r * 0.12} r={r * 0.4} fill="#1A2A3A" opacity={0.15} />
        {/* Specular */}
        <Ellipse cx={cx - r * 0.14} cy={cy - r * 0.18} rx={r * 0.18} ry={r * 0.12} fill="#fff" opacity={0.3} />
        <Ellipse cx={cx - r * 0.1} cy={cy - r * 0.2} rx={r * 0.08} ry={r * 0.05} fill="#fff" opacity={0.2} />
        {/* Craters with depth */}
        <Circle cx={cx - r * 0.16} cy={cy + r * 0.12} r={r * 0.06} fill="#E0D080" opacity={0.4} />
        <Circle cx={cx - r * 0.155} cy={cy + r * 0.11} r={r * 0.025} fill="#D8C470" opacity={0.25} />
        <Circle cx={cx + r * 0.05} cy={cy - r * 0.2} r={r * 0.04} fill="#E0D080" opacity={0.3} />
        <Circle cx={cx - r * 0.04} cy={cy + r * 0.26} r={r * 0.035} fill="#E0D080" opacity={0.3} />
        {/* Outline */}
        <Circle cx={cx} cy={cy} r={r * 0.53} fill="none" stroke="#D4C070" strokeWidth={1} opacity={0.3} />
        {cheeks && (
          <>
            <Circle cx={cx - r * 0.24} cy={cy + r * 0.1} r={r * 0.1} fill="url(#m-ck)" />
            <Circle cx={cx + r * 0.24} cy={cy + r * 0.1} r={r * 0.1} fill="url(#m-ck)" />
          </>
        )}
        <Path d={`M${cx - r * 0.015},${cy + r * 0.03}Q${cx},${cy} ${cx + r * 0.015},${cy + r * 0.03}`}
          fill="none" stroke={dk} strokeWidth={1} strokeLinecap="round" opacity={0.15} />
        <EyesSvg type={eyes} cx={cx} cy={cy} r={r} dark={dk} />
        <MouthSvg type={mouth} cx={cx} cy={cy} r={r} dark={dk} />
        {zzz && (
          <>
            <SvgText x={cx + r * 0.32} y={cy - r * 0.22} fontSize={r * 0.2} fill="#fff" opacity={0.3} fontWeight="800">z</SvgText>
            <SvgText x={cx + r * 0.46} y={cy - r * 0.36} fontSize={r * 0.15} fill="#fff" opacity={0.2} fontWeight="800">z</SvgText>
            <SvgText x={cx + r * 0.55} y={cy - r * 0.46} fontSize={r * 0.1} fill="#fff" opacity={0.12} fontWeight="800">z</SvgText>
          </>
        )}
        {temp < 0 && (
          <>
            <Path d={`M${cx - r * 0.38},${cy - r * 0.36}Q${cx - r * 0.12},${cy - r * 0.72} ${cx + r * 0.12},${cy - r * 0.4}L${cx + r * 0.18},${cy - r * 0.58}`}
              fill="#3B2D70" opacity={0.55} stroke="#5A4A90" strokeWidth={1} />
            <Circle cx={cx + r * 0.2} cy={cy - r * 0.6} r={r * 0.035} fill="#fff" opacity={0.45} />
          </>
        )}
      </Svg>
    </View>
  );
}

// ── 3D Cloud Face ────────────────────────────────────────

function CloudFace({ temp, mood, size, isNight = false }: { temp: number; mood: CloudMood; size: number; isNight?: boolean }) {
  let eyes: string, mouth: string, cheeks = false, brows = false;

  if (mood === 'storm')          { eyes = 'angry';  mouth = 'grr';         brows = true; }
  else if (mood === 'heavy-rain'){ eyes = 'crying'; mouth = 'frown'; }
  else if (mood === 'rain')      { eyes = 'sad';    mouth = 'pout'; }
  else if (mood === 'snow')      { eyes = 'sleepy'; mouth = 'small-smile'; cheeks = true; }
  else if (isNight)              { eyes = 'sleepy'; mouth = 'small-smile'; }
  else if (temp >= 25)           { eyes = 'normal'; mouth = 'small-smile'; }
  else if (temp >= 15)           { eyes = 'normal'; mouth = 'neutral'; }
  else                           { eyes = 'wide';   mouth = 'wavy'; }

  const r = size / 2, cx = r, cy = r;
  const cyo = cy + r * 0.05;

  const dk = mood === 'storm' ? '#1A202C' : isNight ? '#2A3444' : '#4A5568';

  // 3D color sets: [top, fill, highlight]
  const fills = mood === 'storm' ? ['#5C6B7A', '#4A5568', '#6B7A8A'] :
    (mood === 'rain' || mood === 'heavy-rain') ? (isNight ? ['#586E82', '#4A5E72', '#6A8090'] : ['#8BB0C8', '#7A96AD', '#9CC0D5']) :
    mood === 'snow' ? (isNight ? ['#9AAFC5', '#8A9CB5', '#AAC0D5'] : ['#D6E4F7', '#C8DCF0', '#E6F0FF']) :
    isNight ? ['#586878', '#4A5568', '#6A7A8A'] : ['#C8D6E5', '#B8C9D9', '#D8E6F0'];

  const chC = mood === 'snow' ? '#A8C0E0' : '#7A96AD';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="c-top" cx="40%" cy="30%" r="65%">
            <Stop offset="0%" stopColor={fills[2]} />
            <Stop offset="100%" stopColor={fills[0]} />
          </RadialGradient>
          <RadialGradient id="c-bot" cx="45%" cy="35%" r="60%">
            <Stop offset="0%" stopColor={fills[2]} />
            <Stop offset="100%" stopColor={fills[1]} />
          </RadialGradient>
          <RadialGradient id="c-ck">
            <Stop offset="0%" stopColor={chC} stopOpacity="0.45" />
            <Stop offset="100%" stopColor={chC} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Night stars */}
        {isNight && [[-0.7, -0.5, 0.02], [0.75, -0.6, 0.025], [-0.55, 0.55, 0.018], [0.8, 0.3, 0.02]].map(([dx, dy, s], i) => (
          <Circle key={i} cx={cx + r * dx} cy={cy + r * dy} r={r * s} fill="#fff" opacity={0.4} />
        ))}
        {/* 3D Cloud layers */}
        <Ellipse cx={cx - r * 0.26} cy={cyo - r * 0.22} rx={r * 0.4} ry={r * 0.33} fill="url(#c-top)" />
        <Ellipse cx={cx + r * 0.16} cy={cyo - r * 0.18} rx={r * 0.37} ry={r * 0.31} fill="url(#c-top)" />
        <Ellipse cx={cx} cy={cyo + r * 0.08} rx={r * 0.62} ry={r * 0.33} fill="url(#c-bot)" />
        {/* Specular highlights */}
        <Ellipse cx={cx - r * 0.22} cy={cyo - r * 0.34} rx={r * 0.18} ry={r * 0.1} fill="#fff" opacity={mood === 'storm' ? 0.1 : 0.28} />
        <Ellipse cx={cx + r * 0.1} cy={cyo - r * 0.3} rx={r * 0.15} ry={r * 0.08} fill="#fff" opacity={mood === 'storm' ? 0.08 : 0.22} />
        {/* Belly highlight */}
        <Ellipse cx={cx - r * 0.08} cy={cyo + 0.02} rx={r * 0.28} ry={r * 0.08} fill="#fff" opacity={mood === 'storm' ? 0.05 : 0.1} />
        {/* Inner shadow on bottom */}
        <Path d={`M${cx - r * 0.5},${cy + r * 0.25}A${r * 0.62},${r * 0.33} 0 0,0 ${cx + r * 0.5},${cy + r * 0.25}`}
          fill="none" stroke={mood === 'storm' ? '#000' : '#5A6A7A'} strokeWidth={r * 0.02} opacity={0.08} />
        {/* Brows */}
        {brows && (
          <>
            <Line x1={cx - r * 0.26} y1={cyo - r * 0.2} x2={cx - r * 0.1} y2={cyo - r * 0.13} stroke="#2C3A47" strokeWidth={2.8} strokeLinecap="round" />
            <Line x1={cx + r * 0.26} y1={cyo - r * 0.2} x2={cx + r * 0.1} y2={cyo - r * 0.13} stroke="#2C3A47" strokeWidth={2.8} strokeLinecap="round" />
          </>
        )}
        {cheeks && (
          <>
            <Circle cx={cx - r * 0.28} cy={cyo + r * 0.12} r={r * 0.1} fill="url(#c-ck)" />
            <Circle cx={cx + r * 0.28} cy={cyo + r * 0.12} r={r * 0.1} fill="url(#c-ck)" />
          </>
        )}
        {/* Nose */}
        <Path d={`M${cx - r * 0.015},${cyo + r * 0.03}Q${cx},${cyo} ${cx + r * 0.015},${cyo + r * 0.03}`}
          fill="none" stroke={dk} strokeWidth={1} strokeLinecap="round" opacity={0.15} />
        {/* Cloud-specific eyes */}
        <CloudEyesSvg type={eyes} cx={cx} cyo={cyo} r={r} dk={dk} mood={mood} />
        <MouthSvg type={mouth} cx={cx} cy={cyo} r={r} dark={dk} />
        {/* Rain drops — teardrop shapes */}
        {(mood === 'rain' || mood === 'heavy-rain') && (
          <>
            {[[-0.2, 0.42], [-0.02, 0.46], [0.18, 0.43], [0.3, 0.47], [-0.34, 0.47]].map(([dx, dy], i) => (
              <Path key={`r${i}`}
                d={`M${cx + r * dx},${cy + r * dy}Q${cx + r * (dx + 0.01)},${cy + r * (dy + 0.06)} ${cx + r * (dx - 0.01)},${cy + r * (dy + 0.1)}Q${cx + r * (dx - 0.02)},${cy + r * (dy + 0.06)} ${cx + r * dx},${cy + r * dy}Z`}
                fill="#6EC6FF" opacity={0.45} />
            ))}
          </>
        )}
        {mood === 'heavy-rain' && [-0.28, -0.08, 0.1, 0.24, 0.4].map((dx, i) => (
          <Line key={`hr${i}`} x1={cx + r * dx} y1={cy + r * 0.5} x2={cx + r * dx - r * 0.03} y2={cy + r * 0.58}
            stroke="#4A90D9" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
        ))}
        {/* Lightning with glow */}
        {mood === 'storm' && (
          <>
            <Path d={`M${cx - r * 0.04},${cy + r * 0.36}L${cx + r * 0.06},${cy + r * 0.46}L${cx},${cy + r * 0.47}L${cx + r * 0.08},${cy + r * 0.6}`}
              fill="none" stroke="#FFE066" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.18} />
            <Path d={`M${cx - r * 0.04},${cy + r * 0.36}L${cx + r * 0.06},${cy + r * 0.46}L${cx},${cy + r * 0.47}L${cx + r * 0.08},${cy + r * 0.6}`}
              fill="none" stroke="#FFD93D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {/* Snowflakes — 6-pointed */}
        {mood === 'snow' && [[-0.2, 0.44], [0, 0.52], [0.2, 0.46], [-0.1, 0.56], [0.12, 0.5]].map(([dx, dy], i) => {
          const sx = cx + r * dx, sy = cy + r * dy, ss = r * 0.035;
          return (
            <G key={`sn${i}`} opacity={0.4}>
              <Line x1={sx} y1={sy - ss} x2={sx} y2={sy + ss} stroke="#8BA3B8" strokeWidth={1.2} strokeLinecap="round" />
              <Line x1={sx - ss * 0.87} y1={sy - ss * 0.5} x2={sx + ss * 0.87} y2={sy + ss * 0.5} stroke="#8BA3B8" strokeWidth={1.2} strokeLinecap="round" />
              <Line x1={sx - ss * 0.87} y1={sy + ss * 0.5} x2={sx + ss * 0.87} y2={sy - ss * 0.5} stroke="#8BA3B8" strokeWidth={1.2} strokeLinecap="round" />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ── Cloud-specific Eyes ──────────────────────────────────

function CloudEyesSvg({ type, cx, cyo, r, dk, mood }: { type: string; cx: number; cyo: number; r: number; dk: string; mood: string }) {
  const ed = mood === 'snow' ? '#6B84A3' : dk;
  if (type === 'sad') return (
    <>
      <Circle cx={cx - r * 0.15} cy={cyo - r * 0.02} r={r * 0.055} fill="#4A6B8A" />
      <Circle cx={cx + r * 0.15} cy={cyo - r * 0.02} r={r * 0.055} fill="#4A6B8A" />
      <Circle cx={cx - r * 0.14} cy={cyo - r * 0.04} r={r * 0.02} fill="#fff" opacity={0.7} />
      <Circle cx={cx + r * 0.14} cy={cyo - r * 0.04} r={r * 0.02} fill="#fff" opacity={0.7} />
      <Path d={`M${cx - r * 0.22},${cyo - r * 0.12}Q${cx - r * 0.15},${cyo - r * 0.16} ${cx - r * 0.09},${cyo - r * 0.1}`} fill="none" stroke="#4A6B8A" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
      <Path d={`M${cx + r * 0.09},${cyo - r * 0.1}Q${cx + r * 0.15},${cyo - r * 0.16} ${cx + r * 0.22},${cyo - r * 0.12}`} fill="none" stroke="#4A6B8A" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
    </>
  );
  if (type === 'crying') return (
    <>
      <Circle cx={cx - r * 0.15} cy={cyo - r * 0.02} r={r * 0.06} fill="#4A6B8A" />
      <Circle cx={cx + r * 0.15} cy={cyo - r * 0.02} r={r * 0.06} fill="#4A6B8A" />
      <Circle cx={cx - r * 0.14} cy={cyo - r * 0.04} r={r * 0.022} fill="#fff" opacity={0.8} />
      <Circle cx={cx + r * 0.14} cy={cyo - r * 0.04} r={r * 0.022} fill="#fff" opacity={0.8} />
      <Path d={`M${cx - r * 0.15},${cyo + r * 0.04}Q${cx - r * 0.17},${cyo + r * 0.2} ${cx - r * 0.13},${cyo + r * 0.26}`} fill="none" stroke="#6EC6FF" strokeWidth={2.2} strokeLinecap="round" opacity={0.5} />
      <Path d={`M${cx + r * 0.15},${cyo + r * 0.04}Q${cx + r * 0.17},${cyo + r * 0.22} ${cx + r * 0.13},${cyo + r * 0.28}`} fill="none" stroke="#6EC6FF" strokeWidth={2.2} strokeLinecap="round" opacity={0.4} />
      <Circle cx={cx - r * 0.13} cy={cyo + r * 0.27} r={r * 0.018} fill="#6EC6FF" opacity={0.35} />
      <Circle cx={cx + r * 0.13} cy={cyo + r * 0.29} r={r * 0.018} fill="#6EC6FF" opacity={0.3} />
    </>
  );
  if (type === 'angry') return (
    <>
      <Circle cx={cx - r * 0.15} cy={cyo - r * 0.02} r={r * 0.055} fill="#1A202C" />
      <Circle cx={cx + r * 0.15} cy={cyo - r * 0.02} r={r * 0.055} fill="#1A202C" />
      <Circle cx={cx - r * 0.14} cy={cyo - r * 0.035} r={r * 0.018} fill="#C53030" opacity={0.8} />
      <Circle cx={cx + r * 0.14} cy={cyo - r * 0.035} r={r * 0.018} fill="#C53030" opacity={0.8} />
    </>
  );
  if (type === 'sleepy') return (
    <>
      <Path d={`M${cx - r * 0.23},${cyo}Q${cx - r * 0.15},${cyo - r * 0.1} ${cx - r * 0.08},${cyo}`} fill="none" stroke={ed} strokeWidth={2.2} strokeLinecap="round" />
      <Path d={`M${cx + r * 0.08},${cyo}Q${cx + r * 0.15},${cyo - r * 0.1} ${cx + r * 0.23},${cyo}`} fill="none" stroke={ed} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={cx - r * 0.17} y1={cyo - r * 0.06} x2={cx - r * 0.17} y2={cyo - r * 0.1} stroke={ed} strokeWidth={1.2} strokeLinecap="round" opacity={0.4} />
      <Line x1={cx + r * 0.17} y1={cyo - r * 0.06} x2={cx + r * 0.17} y2={cyo - r * 0.1} stroke={ed} strokeWidth={1.2} strokeLinecap="round" opacity={0.4} />
    </>
  );
  return <EyesSvg type={type} cx={cx} cy={cyo} r={r} dark={dk} />;
}

// ── Shared Eyes ──────────────────────────────────────────

function EyesSvg({ type, cx, cy, r, dark }: { type: string; cx: number; cy: number; r: number; dark: string }) {
  const s = r * 0.055;
  if (type === 'normal') return (
    <>
      <Path d={`M${cx - r * 0.24},${cy - r * 0.08}Q${cx - r * 0.17},${cy - r * 0.16} ${cx - r * 0.1},${cy - r * 0.08}`} fill="none" stroke={dark} strokeWidth={1} strokeLinecap="round" opacity={0.12} />
      <Path d={`M${cx + r * 0.1},${cy - r * 0.08}Q${cx + r * 0.17},${cy - r * 0.16} ${cx + r * 0.24},${cy - r * 0.08}`} fill="none" stroke={dark} strokeWidth={1} strokeLinecap="round" opacity={0.12} />
      <Ellipse cx={cx - r * 0.17} cy={cy - r * 0.07} rx={s * 1.15} ry={s * 1.05} fill="#fff" opacity={0.3} />
      <Ellipse cx={cx + r * 0.17} cy={cy - r * 0.07} rx={s * 1.15} ry={s * 1.05} fill="#fff" opacity={0.3} />
      <Circle cx={cx - r * 0.17} cy={cy - r * 0.08} r={s} fill={dark} />
      <Circle cx={cx + r * 0.17} cy={cy - r * 0.08} r={s} fill={dark} />
      <Circle cx={cx - r * 0.155} cy={cy - r * 0.1} r={r * 0.022} fill="#fff" />
      <Circle cx={cx - r * 0.185} cy={cy - r * 0.065} r={r * 0.012} fill="#fff" opacity={0.6} />
      <Circle cx={cx + r * 0.155} cy={cy - r * 0.1} r={r * 0.022} fill="#fff" />
      <Circle cx={cx + r * 0.185} cy={cy - r * 0.065} r={r * 0.012} fill="#fff" opacity={0.6} />
    </>
  );
  if (type === 'happy') return (
    <>
      <Path d={`M${cx - r * 0.25},${cy - r * 0.05}Q${cx - r * 0.17},${cy - r * 0.2} ${cx - r * 0.09},${cy - r * 0.05}`} fill="none" stroke={dark} strokeWidth={2.8} strokeLinecap="round" />
      <Path d={`M${cx + r * 0.09},${cy - r * 0.05}Q${cx + r * 0.17},${cy - r * 0.2} ${cx + r * 0.25},${cy - r * 0.05}`} fill="none" stroke={dark} strokeWidth={2.8} strokeLinecap="round" />
      <Line x1={cx - r * 0.25} y1={cy - r * 0.05} x2={cx - r * 0.28} y2={cy - r * 0.09} stroke={dark} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
      <Line x1={cx + r * 0.25} y1={cy - r * 0.05} x2={cx + r * 0.28} y2={cy - r * 0.09} stroke={dark} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
    </>
  );
  if (type === 'shades') return (
    <>
      <Rect x={cx - r * 0.33} y={cy - r * 0.2} width={r * 0.28} height={r * 0.2} rx={4} fill="#1a1008" />
      <Rect x={cx - r * 0.33} y={cy - r * 0.2} width={r * 0.28} height={r * 0.1} rx={4} fill="#3a2818" opacity={0.4} />
      <Rect x={cx + r * 0.05} y={cy - r * 0.2} width={r * 0.28} height={r * 0.2} rx={4} fill="#1a1008" />
      <Rect x={cx + r * 0.05} y={cy - r * 0.2} width={r * 0.28} height={r * 0.1} rx={4} fill="#3a2818" opacity={0.4} />
      <Line x1={cx - r * 0.05} y1={cy - r * 0.1} x2={cx + r * 0.05} y2={cy - r * 0.1} stroke="#2C1810" strokeWidth={2.2} />
      <Line x1={cx - r * 0.33} y1={cy - r * 0.12} x2={cx - r * 0.44} y2={cy - r * 0.16} stroke="#2C1810" strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={cx + r * 0.33} y1={cy - r * 0.12} x2={cx + r * 0.44} y2={cy - r * 0.16} stroke="#2C1810" strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={cx - r * 0.28} y1={cy - r * 0.17} x2={cx - r * 0.18} y2={cy - r * 0.17} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.3} />
      <Line x1={cx + r * 0.1} y1={cy - r * 0.17} x2={cx + r * 0.2} y2={cy - r * 0.17} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.3} />
    </>
  );
  if (type === 'wide') return (
    <>
      <Circle cx={cx - r * 0.17} cy={cy - r * 0.08} r={r * 0.09} fill="#fff" stroke={dark} strokeWidth={1.5} />
      <Circle cx={cx + r * 0.17} cy={cy - r * 0.08} r={r * 0.09} fill="#fff" stroke={dark} strokeWidth={1.5} />
      <Circle cx={cx - r * 0.16} cy={cy - r * 0.07} r={r * 0.055} fill={dark} opacity={0.3} />
      <Circle cx={cx + r * 0.16} cy={cy - r * 0.07} r={r * 0.055} fill={dark} opacity={0.3} />
      <Circle cx={cx - r * 0.16} cy={cy - r * 0.07} r={r * 0.04} fill={dark} />
      <Circle cx={cx + r * 0.16} cy={cy - r * 0.07} r={r * 0.04} fill={dark} />
      <Circle cx={cx - r * 0.145} cy={cy - r * 0.09} r={r * 0.025} fill="#fff" />
      <Circle cx={cx + r * 0.145} cy={cy - r * 0.09} r={r * 0.025} fill="#fff" />
    </>
  );
  if (type === 'squint') return (
    <>
      <Line x1={cx - r * 0.24} y1={cy - r * 0.08} x2={cx - r * 0.1} y2={cy - r * 0.08} stroke={dark} strokeWidth={3} strokeLinecap="round" />
      <Line x1={cx + r * 0.1} y1={cy - r * 0.08} x2={cx + r * 0.24} y2={cy - r * 0.08} stroke={dark} strokeWidth={3} strokeLinecap="round" />
    </>
  );
  if (type === 'sleepy') return (
    <>
      <Path d={`M${cx - r * 0.23},${cy - r * 0.06}Q${cx - r * 0.16},${cy - r * 0.14} ${cx - r * 0.09},${cy - r * 0.06}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />
      <Path d={`M${cx + r * 0.09},${cy - r * 0.06}Q${cx + r * 0.16},${cy - r * 0.14} ${cx + r * 0.23},${cy - r * 0.06}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={cx - r * 0.18} y1={cy - r * 0.11} x2={cx - r * 0.18} y2={cy - r * 0.15} stroke={dark} strokeWidth={1.2} strokeLinecap="round" opacity={0.4} />
      <Line x1={cx + r * 0.18} y1={cy - r * 0.11} x2={cx + r * 0.18} y2={cy - r * 0.15} stroke={dark} strokeWidth={1.2} strokeLinecap="round" opacity={0.4} />
    </>
  );
  if (type === 'x') return (
    <>
      <Line x1={cx - r * 0.23} y1={cy - r * 0.15} x2={cx - r * 0.11} y2={cy - r * 0.03} stroke={dark} strokeWidth={2.8} strokeLinecap="round" />
      <Line x1={cx - r * 0.11} y1={cy - r * 0.15} x2={cx - r * 0.23} y2={cy - r * 0.03} stroke={dark} strokeWidth={2.8} strokeLinecap="round" />
      <Line x1={cx + r * 0.11} y1={cy - r * 0.15} x2={cx + r * 0.23} y2={cy - r * 0.03} stroke={dark} strokeWidth={2.8} strokeLinecap="round" />
      <Line x1={cx + r * 0.23} y1={cy - r * 0.15} x2={cx + r * 0.11} y2={cy - r * 0.03} stroke={dark} strokeWidth={2.8} strokeLinecap="round" />
    </>
  );
  return null;
}

// ── Shared Mouths ────────────────────────────────────────

function MouthSvg({ type, cx, cy, r, dark }: { type: string; cx: number; cy: number; r: number; dark: string }) {
  if (type === 'big-smile') return (
    <>
      <Path d={`M${cx - r * 0.22},${cy + r * 0.08}Q${cx},${cy + r * 0.34} ${cx + r * 0.22},${cy + r * 0.08}`} fill="#E8903A" stroke={dark} strokeWidth={1.8} />
      <Ellipse cx={cx} cy={cy + r * 0.24} rx={r * 0.07} ry={r * 0.05} fill="#E06060" opacity={0.65} />
      <Line x1={cx - r * 0.08} y1={cy + r * 0.12} x2={cx + r * 0.08} y2={cy + r * 0.12} stroke="#fff" strokeWidth={1.5} strokeLinecap="round" opacity={0.55} />
    </>
  );
  if (type === 'smile') return <Path d={`M${cx - r * 0.16},${cy + r * 0.12}Q${cx},${cy + r * 0.26} ${cx + r * 0.16},${cy + r * 0.12}`} fill="none" stroke={dark} strokeWidth={2.4} strokeLinecap="round" />;
  if (type === 'small-smile') return <Path d={`M${cx - r * 0.1},${cy + r * 0.14}Q${cx},${cy + r * 0.22} ${cx + r * 0.1},${cy + r * 0.14}`} fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round" />;
  if (type === 'smirk') return (
    <>
      <Path d={`M${cx - r * 0.08},${cy + r * 0.14}Q${cx + r * 0.05},${cy + r * 0.24} ${cx + r * 0.2},${cy + r * 0.1}`} fill="none" stroke={dark} strokeWidth={2.4} strokeLinecap="round" />
      <Circle cx={cx + r * 0.22} cy={cy + r * 0.1} r={r * 0.015} fill={dark} opacity={0.2} />
    </>
  );
  if (type === 'neutral') return <Line x1={cx - r * 0.09} y1={cy + r * 0.14} x2={cx + r * 0.09} y2={cy + r * 0.14} stroke={dark} strokeWidth={2.2} strokeLinecap="round" />;
  if (type === 'wavy') return <Path d={`M${cx - r * 0.16},${cy + r * 0.14}Q${cx - r * 0.06},${cy + r * 0.07} ${cx},${cy + r * 0.14}Q${cx + r * 0.06},${cy + r * 0.21} ${cx + r * 0.16},${cy + r * 0.14}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />;
  if (type === 'open-frown') return (
    <>
      <Ellipse cx={cx} cy={cy + r * 0.18} rx={r * 0.11} ry={r * 0.09} fill={dark} />
      <Ellipse cx={cx} cy={cy + r * 0.2} rx={r * 0.07} ry={r * 0.04} fill="#8B0000" opacity={0.25} />
    </>
  );
  if (type === 'chatter') return (
    <>
      <Rect x={cx - r * 0.13} y={cy + r * 0.09} width={r * 0.26} height={r * 0.05} rx={2.5} fill={dark} />
      <Rect x={cx - r * 0.11} y={cy + r * 0.17} width={r * 0.22} height={r * 0.04} rx={2} fill={dark} />
      {[-0.06, -0.02, 0.02, 0.06].map((dx, i) => (
        <Line key={i} x1={cx + r * dx} y1={cy + r * 0.09} x2={cx + r * dx} y2={cy + r * 0.14} stroke="#fff" strokeWidth={1} opacity={0.35} />
      ))}
    </>
  );
  if (type === 'pout') return <Path d={`M${cx - r * 0.12},${cy + r * 0.19}Q${cx},${cy + r * 0.1} ${cx + r * 0.12},${cy + r * 0.19}`} fill="none" stroke={dark} strokeWidth={2.2} strokeLinecap="round" />;
  if (type === 'frown') return <Path d={`M${cx - r * 0.16},${cy + r * 0.21}Q${cx},${cy + r * 0.1} ${cx + r * 0.16},${cy + r * 0.21}`} fill="none" stroke={dark} strokeWidth={2.4} strokeLinecap="round" />;
  if (type === 'grr') return (
    <>
      <Path d={`M${cx - r * 0.14},${cy + r * 0.17}Q${cx},${cy + r * 0.07} ${cx + r * 0.14},${cy + r * 0.17}`} fill="none" stroke={dark} strokeWidth={2.4} strokeLinecap="round" />
      <Line x1={cx - r * 0.06} y1={cy + r * 0.12} x2={cx - r * 0.05} y2={cy + r * 0.16} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.45} />
      <Line x1={cx + r * 0.06} y1={cy + r * 0.12} x2={cx + r * 0.05} y2={cy + r * 0.16} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.45} />
    </>
  );
  return null;
}
