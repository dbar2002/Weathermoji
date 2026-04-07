import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet, Keyboard, ActivityIndicator, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { getCountryName } from '../utils/countries';
import type { CityResult } from '../utils/weatherApi';

// Free flag CDN — returns PNG flags by country code
const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

interface Props {
  onSelectCity: (lat: number, lon: number) => void;
  searchCity: (query: string) => Promise<CityResult[]>;
}

export default function SearchBar({ onSelectCity, searchCity }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }

    setSearching(true);

    // Debounce: wait 400ms after user stops typing
    debounceRef.current = setTimeout(async () => {
      try {
        const cities = await searchCity(text);
        setResults(cities);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [searchCity]);

  const handleSelect = useCallback((city: CityResult) => {
    const countryName = getCountryName(city.country);
    const display = city.state
      ? `${city.name}, ${city.state}`
      : `${city.name}, ${countryName}`;
    setQuery(display);
    setShowResults(false);
    setResults([]);
    Keyboard.dismiss();
    onSelectCity(city.lat, city.lon);
  }, [onSelectCity]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSearching(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  return (
    <View style={s.wrapper}>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Search any city..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
        />
        {searching && <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={{ marginRight: SPACING.xs }} />}
        {query.length > 0 && !searching && (
          <TouchableOpacity onPress={handleClear} style={s.clear}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showResults && results.length > 0 && (
        <ScrollView style={s.dropdown} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {results.map((item, i) => {
            const countryName = getCountryName(item.country);

            return (
              <TouchableOpacity
                key={`${item.lat}-${item.lon}-${i}`}
                style={[s.resultItem, i === results.length - 1 && s.resultItemLast]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
              >
                <Image
                  source={{ uri: getFlagUrl(item.country) }}
                  style={s.flagImg}
                />
                <View style={s.resultTextWrap}>
                  <Text style={s.resultCity}>{item.name}</Text>
                  <Text style={s.resultMeta}>
                    {item.state ? `${item.state}, ` : ''}{countryName}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {showResults && results.length === 0 && !searching && query.length >= 2 && (
        <View style={s.dropdown}>
          <View style={s.noResults}>
            <Text style={s.noResultsText}>No cities found for "{query}"</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { zIndex: 100, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.medium,
    color: '#fff',
    paddingVertical: SPACING.xs,
  },
  clear: { padding: SPACING.xs, marginLeft: SPACING.sm },
  clearText: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    maxHeight: 280,
    ...SHADOWS.cardHover,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloudWhite,
  },
  resultItemLast: { borderBottomWidth: 0 },
  flagImg: {
    width: 28,
    height: 20,
    borderRadius: 3,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultTextWrap: { flex: 1 },
  resultCity: { fontSize: FONT_SIZES.body, fontFamily: FONTS.semibold, color: COLORS.text },
  resultMeta: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 2 },
  noResults: { alignItems: 'center', paddingVertical: SPACING.lg },
  noResultsText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.medium, color: COLORS.textLight },
});
