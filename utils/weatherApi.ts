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

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyItem[];
  daily: DailyItem[];
  city: string;
  country: string;
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

  return {
    current: parseCurrentWeather(current),
    hourly: parseHourlyForecast(forecast),
    daily: parseDailyForecast(forecast),
    city: current.name,
    country: current.sys?.country ?? '',
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
