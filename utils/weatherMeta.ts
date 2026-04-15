import type { GradientKey } from '../constants/theme';

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'mist';
export type CloudMood = 'neutral' | 'rain' | 'heavy-rain' | 'storm' | 'snow';

export interface WeatherMeta {
  label: string;
  bg: GradientKey;
  type: WeatherType;
}

const MAP: Record<number, WeatherMeta> = {
  200: { label: 'Stormy!', bg: 'gradientStormy', type: 'storm' },
  201: { label: 'Thunder rumble', bg: 'gradientStormy', type: 'storm' },
  202: { label: 'Heavy thunder!', bg: 'gradientStormy', type: 'storm' },
  210: { label: 'Light zaps', bg: 'gradientStormy', type: 'storm' },
  211: { label: 'Zap zap!', bg: 'gradientStormy', type: 'storm' },
  212: { label: 'Electric sky!', bg: 'gradientStormy', type: 'storm' },
  221: { label: 'Ragged thunder', bg: 'gradientStormy', type: 'storm' },
  230: { label: 'Drizzle + thunder', bg: 'gradientStormy', type: 'storm' },
  231: { label: 'Drizzle + thunder', bg: 'gradientStormy', type: 'storm' },
  232: { label: 'Heavy drizzle storm', bg: 'gradientStormy', type: 'storm' },
  300: { label: 'Light drizzle', bg: 'gradientRainy', type: 'rain' },
  301: { label: 'Drizzly', bg: 'gradientRainy', type: 'rain' },
  302: { label: 'Heavy drizzle', bg: 'gradientRainy', type: 'rain' },
  310: { label: 'Light rain drizzle', bg: 'gradientRainy', type: 'rain' },
  311: { label: 'Drizzle rain', bg: 'gradientRainy', type: 'rain' },
  312: { label: 'Heavy drizzle rain', bg: 'gradientRainy', type: 'rain' },
  500: { label: 'Light rain', bg: 'gradientRainy', type: 'rain' },
  501: { label: 'Rainy day', bg: 'gradientRainy', type: 'rain' },
  502: { label: 'Pouring!', bg: 'gradientRainy', type: 'rain' },
  503: { label: 'Very heavy rain', bg: 'gradientRainy', type: 'rain' },
  504: { label: 'Extreme rain!', bg: 'gradientRainy', type: 'rain' },
  511: { label: 'Freezing rain', bg: 'gradientSnow', type: 'rain' },
  520: { label: 'Light shower', bg: 'gradientRainy', type: 'rain' },
  521: { label: 'Shower rain', bg: 'gradientRainy', type: 'rain' },
  522: { label: 'Heavy showers', bg: 'gradientRainy', type: 'rain' },
  600: { label: 'Light snow', bg: 'gradientSnow', type: 'snow' },
  601: { label: 'Snowy!', bg: 'gradientSnow', type: 'snow' },
  602: { label: 'Heavy snow!', bg: 'gradientSnow', type: 'snow' },
  611: { label: 'Sleet', bg: 'gradientSnow', type: 'snow' },
  612: { label: 'Sleet shower', bg: 'gradientSnow', type: 'snow' },
  615: { label: 'Rain + snow', bg: 'gradientSnow', type: 'snow' },
  620: { label: 'Snow shower', bg: 'gradientSnow', type: 'snow' },
  621: { label: 'Snow shower', bg: 'gradientSnow', type: 'snow' },
  622: { label: 'Heavy snow shower', bg: 'gradientSnow', type: 'snow' },
  701: { label: 'Misty', bg: 'gradientMist', type: 'mist' },
  711: { label: 'Smoky', bg: 'gradientMist', type: 'mist' },
  721: { label: 'Hazy', bg: 'gradientMist', type: 'mist' },
  741: { label: 'Foggy', bg: 'gradientMist', type: 'mist' },
  781: { label: 'Tornado!!', bg: 'gradientStormy', type: 'storm' },
  800: { label: 'Sunny vibes!', bg: 'gradientSunny', type: 'clear' },
  801: { label: 'Few clouds', bg: 'gradientSunny', type: 'clear' },
  802: { label: 'Partly cloudy', bg: 'gradientCloudy', type: 'cloudy' },
  803: { label: 'Mostly cloudy', bg: 'gradientCloudy', type: 'cloudy' },
  804: { label: 'Overcast', bg: 'gradientCloudy', type: 'cloudy' },
};

const NIGHT_OVERRIDES: Partial<Record<number, WeatherMeta>> = {
  800: { label: 'Clear night', bg: 'gradientNight', type: 'clear' },
  801: { label: 'Few clouds tonight', bg: 'gradientNight', type: 'clear' },
};

export function getWeatherMeta(code: number, isNight = false): WeatherMeta {
  if (isNight && NIGHT_OVERRIDES[code]) return NIGHT_OVERRIDES[code]!;
  const base = MAP[code] || { label: 'Mystery weather', bg: 'gradientCloudy' as GradientKey, type: 'cloudy' as WeatherType };

  // Swap to dark gradients at night
  if (isNight) {
    const nightBgMap: Partial<Record<GradientKey, GradientKey>> = {
      gradientCloudy: 'gradientCloudyNight',
      gradientRainy: 'gradientRainyNight',
      gradientSnow: 'gradientSnowNight',
      gradientMist: 'gradientMistNight',
      gradientSunny: 'gradientNight',
    };
    const nightBg = nightBgMap[base.bg];
    if (nightBg) return { ...base, bg: nightBg };
  }

  return base;
}

export function getCloudMood(code: number): CloudMood {
  const m = MAP[code];
  if (!m) return 'neutral';
  if (m.type === 'storm') return 'storm';
  if (m.type === 'snow') return 'snow';
  if (m.type === 'rain') return code >= 502 ? 'heavy-rain' : 'rain';
  return 'neutral';
}

export function getTempMessage(tempC: number): string {
  if (tempC >= 38) return 'Scorching hot!';      // 100°F+
  if (tempC >= 32) return 'Hot stuff!';           // 90°F+
  if (tempC >= 26) return 'Sunglass weather!';    // 79°F+
  if (tempC >= 21) return 'Warm & lovely';        // 70°F+
  if (tempC >= 16) return 'Perfect weather!';     // 61°F+
  if (tempC >= 10) return 'Nice & mild';          // 50°F+
  if (tempC >= 4) return 'Grab a jacket!';        // 39°F+
  if (tempC >= -1) return 'Chilly out there!';    // 30°F+
  if (tempC >= -7) return 'Freezing cold!';       // 19°F+
  return 'Brrr! Sub-zero!';
}
