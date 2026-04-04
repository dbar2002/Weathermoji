import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { fetchWeather, searchCity, type WeatherData, type UnitSystem, type CityResult } from '../utils/weatherApi';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [unit, setUnit] = useState<UnitSystem>('metric');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setError('Location permission denied. Search for a city instead!'); setLoading(false); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      } catch { setError('Could not get location. Search for a city!'); setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchWeather(location.lat, location.lon, unit);
        if (!cancelled) { setWeather(data); setLoading(false); }
      } catch { if (!cancelled) { setError('Failed to fetch weather. Check your API key!'); setLoading(false); } }
    })();
    return () => { cancelled = true; };
  }, [location, unit]);

  const refresh = useCallback(async () => {
    if (!location) return;
    setLoading(true); setError(null);
    try { setWeather(await fetchWeather(location.lat, location.lon, unit)); }
    catch { setError('Failed to refresh. Try again!'); }
    finally { setLoading(false); }
  }, [location, unit]);

  const selectCity = useCallback((lat: number, lon: number) => setLocation({ lat, lon }), []);
  const toggleUnit = useCallback(() => setUnit((p) => (p === 'metric' ? 'imperial' : 'metric')), []);

  return { weather, loading, error, unit, refresh, selectCity, toggleUnit, searchCity };
}
