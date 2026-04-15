const BASE_URL = 'https://api.openweathermap.org';
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '';

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  conditionCode: number;
  description: string;
  icon: string;
  isNight: boolean;
  sunrise: number;
  sunset: number;
  visibility: number;
  clouds: number;
}

export interface HourlyItem {
  time: number;
  temp: number;
  conditionCode: number;
  description: string;
  icon: string;
  pop: number;
  windSpeed: number;
}

export interface DailyItem {
  date: number;
  tempMin: number;
  tempMax: number;
  conditionCode: number;
  pop: number;
}

export interface AirQuality {
  aqi: number;        // 1-5 scale
  aqiLabel: string;   // Good, Fair, Moderate, Poor, Very Poor
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyItem[];
  daily: DailyItem[];
  airQuality: AirQuality | null;
  city: string;
  country: string;
  timezoneOffset: number; // seconds from UTC
}

export interface CityResult {
  name: string;
  country: string;
  state: string | null;
  lat: number;
  lon: number;
  displayName: string;
}

export type UnitSystem = 'metric' | 'imperial';

export async function fetchWeather(lat: number, lon: number, units: UnitSystem = 'metric'): Promise<WeatherData> {
  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  console.log('[Weathermoji] Fetching:', url);

  const currentRes = await fetch(url);
  if (!currentRes.ok) {
    const body = await currentRes.text();
    console.error(`[Weathermoji] API error ${currentRes.status}:`, body);
    throw new Error(`Weather API error: ${currentRes.status}`);
  }
  const current = await currentRes.json();
  console.log('[Weathermoji] Got weather for:', current.name);

  const forecastRes = await fetch(
    `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
  );
  if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);
  const forecast = await forecastRes.json();

  // TODO: AQI disabled — revisit EPA calculation later
  // const airQuality = await fetchAirQuality(lat, lon);
  const airQuality: AirQuality | null = null;

  return {
    current: parseCurrentWeather(current),
    hourly: parseHourlyForecast(forecast),
    daily: parseDailyForecast(forecast),
    airQuality,
    city: current.name,
    country: current.sys?.country ?? '',
    timezoneOffset: current.timezone ?? 0, // seconds from UTC
  };
}

export async function searchCity(query: string, limit = 5): Promise<CityResult[]> {
  const res = await fetch(
    `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Geo API error: ${res.status}`);
  const data = await res.json();
  return data.map((item: any) => ({
    name: item.name,
    country: item.country,
    state: item.state || null,
    lat: item.lat,
    lon: item.lon,
    displayName: item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`,
  }));
}

function parseCurrentWeather(data: any): CurrentWeather {
  const now = Date.now() / 1000;
  return {
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    conditionCode: data.weather[0].id,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    isNight: now < data.sys.sunrise || now > data.sys.sunset,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    visibility: data.visibility,
    clouds: data.clouds?.all ?? 0,
  };
}

function parseHourlyForecast(data: any): HourlyItem[] {
  return data.list.slice(0, 8).map((item: any) => ({
    time: item.dt,
    temp: Math.round(item.main.temp),
    conditionCode: item.weather[0].id,
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    pop: Math.round((item.pop || 0) * 100),
    windSpeed: item.wind.speed,
  }));
}

function parseDailyForecast(data: any): DailyItem[] {
  const days: Record<string, { date: number; temps: number[]; conditions: number[]; pops: number[] }> = {};
  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!days[date]) days[date] = { date: item.dt, temps: [], conditions: [], pops: [] };
    days[date].temps.push(item.main.temp);
    days[date].conditions.push(item.weather[0].id);
    days[date].pops.push(item.pop || 0);
  });
  return Object.values(days).slice(0, 7).map((day) => ({
    date: day.date,
    tempMin: Math.round(Math.min(...day.temps)),
    tempMax: Math.round(Math.max(...day.temps)),
    conditionCode: getMostRelevantCondition(day.conditions),
    pop: Math.round(Math.max(...day.pops) * 100),
  }));
}

function getMostRelevantCondition(conditions: number[]): number {
  const priority = [200,201,202,210,211,212,781,771,762,602,601,622,621,502,503,504,522,501,500,520,521,600,611,612,613,615,616,620,300,301,302,310,311,312,313,314,321,701,711,721,731,741,751,761,804,803,802,801,800];
  let bestIdx = Infinity, bestCode = conditions[0];
  for (const code of conditions) {
    const idx = priority.indexOf(code);
    if (idx !== -1 && idx < bestIdx) { bestIdx = idx; bestCode = code; }
  }
  return bestCode;
}

// ── EPA AQI Calculation ──────────────────────────────────
// Breakpoints: [Clow, Chigh, Ilow, Ihigh]
type Breakpoint = [number, number, number, number];

// EPA AQI breakpoints — all in the units EPA expects
// PM2.5: µg/m³ (OWM gives µg/m³ ✓)
// PM10: µg/m³ (OWM gives µg/m³ ✓)
// O3: ppb (OWM gives µg/m³, convert: ppb = µg/m³ / 2.0)
// NO2: ppb (OWM gives µg/m³, convert: ppb = µg/m³ / 1.88)
// SO2: ppb (OWM gives µg/m³, convert: ppb = µg/m³ / 2.62)
// CO: ppm (OWM gives µg/m³, convert: ppm = µg/m³ / 1145)

const PM25_BP: Breakpoint[] = [
  [0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150],
  [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500],
];
const PM10_BP: Breakpoint[] = [
  [0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150],
  [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500],
];
// O3 8-hour in ppb
const O3_BP: Breakpoint[] = [
  [0, 54, 0, 50], [55, 70, 51, 100], [71, 85, 101, 150],
  [86, 105, 151, 200], [106, 200, 201, 300],
];
// NO2 1-hour in ppb
const NO2_BP: Breakpoint[] = [
  [0, 53, 0, 50], [54, 100, 51, 100], [101, 360, 101, 150],
  [361, 649, 151, 200], [650, 1249, 201, 300], [1250, 2049, 301, 500],
];
// SO2 1-hour in ppb
const SO2_BP: Breakpoint[] = [
  [0, 35, 0, 50], [36, 75, 51, 100], [76, 185, 101, 150],
  [186, 304, 151, 200], [305, 604, 201, 300], [605, 1004, 301, 500],
];
// CO 8-hour in ppm
const CO_BP: Breakpoint[] = [
  [0, 4.4, 0, 50], [4.5, 9.4, 51, 100], [9.5, 12.4, 101, 150],
  [12.5, 15.4, 151, 200], [15.5, 30.4, 201, 300], [30.5, 50.4, 301, 500],
];

function calcEpaAqi(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration < 0) return 0;
  for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
    if (concentration >= cLow && concentration <= cHigh) {
      return ((iHigh - iLow) / (cHigh - cLow)) * (concentration - cLow) + iLow;
    }
  }
  return 500; // Beyond scale
}

function getEpaLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}
