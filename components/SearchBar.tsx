import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Keyboard } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, SHADOWS } from '../constants/theme';
import type { CityResult } from '../utils/weatherApi';

interface Props {
  onSelectCity: (lat: number, lon: number) => void;
  searchCity: (query: string) => Promise<CityResult[]>;
}

export default function SearchBar({ onSelectCity, searchCity }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); setShowResults(false); return; }
    setSearching(true);
    try { setResults(await searchCity(text)); setShowResults(true); }
    catch { setResults([]); }
    finally { setSearching(false); }
  }, [searchCity]);

  const handleSelect = useCallback((city: CityResult) => {
    setQuery(city.displayName); setShowResults(false); setResults([]); Keyboard.dismiss();
    onSelectCity(city.lat, city.lon);
  }, [onSelectCity]);

  return (
    <View style={s.wrapper}>
      <View style={s.inputRow}>
        <Text style={s.icon}>🔍</Text>
        <TextInput style={s.input} placeholder="Search city..." placeholderTextColor={COLORS.textLight}
          value={query} onChangeText={handleSearch} returnKeyType="search" autoCorrect={false} />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setShowResults(false); }} style={s.clear}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {showResults && results.length > 0 && (
        <View style={s.dropdown}>
          <FlatList data={results} keyExtractor={(item, i) => `${item.lat}-${item.lon}-${i}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={s.resultItem} onPress={() => handleSelect(item)} activeOpacity={0.6}>
                <Text style={s.resultEmoji}>📍</Text>
                <View style={s.resultTextWrap}>
                  <Text style={s.resultCity}>{item.name}</Text>
                  <Text style={s.resultMeta}>{item.state ? `${item.state}, ` : ''}{item.country}</Text>
                </View>
              </TouchableOpacity>
            )} />
        </View>
      )}
      {showResults && results.length === 0 && !searching && query.length >= 2 && (
        <View style={s.dropdown}>
          <View style={s.noResults}><Text style={{ fontSize: 32 }}>🤔</Text><Text style={s.noResultsText}>No cities found</Text></View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { zIndex: 100, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, ...SHADOWS.card },
  icon: { fontSize: 18, marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONT_SIZES.body, fontFamily: FONTS.medium, color: COLORS.text, paddingVertical: SPACING.xs },
  clear: { padding: SPACING.xs, marginLeft: SPACING.sm },
  clearText: { fontSize: 16, color: COLORS.textLight, fontWeight: '600' },
  dropdown: { position: 'absolute', top: 56, left: 0, right: 0, backgroundColor: COLORS.card, borderRadius: RADIUS.md, maxHeight: 240, ...SHADOWS.cardHover, overflow: 'hidden' },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.cloudWhite },
  resultEmoji: { fontSize: 20, marginRight: SPACING.sm },
  resultTextWrap: { flex: 1 },
  resultCity: { fontSize: FONT_SIZES.body, fontFamily: FONTS.semibold, color: COLORS.text },
  resultMeta: { fontSize: FONT_SIZES.caption, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 2 },
  noResults: { alignItems: 'center', paddingVertical: SPACING.lg },
  noResultsText: { fontSize: FONT_SIZES.body, fontFamily: FONTS.medium, color: COLORS.textLight, marginTop: SPACING.xs },
});
