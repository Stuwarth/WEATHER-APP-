import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator, Animated, TouchableOpacity, Platform } from 'react-native';
import WindCompass from './components/WindCompass';
import PressureDial from './components/PressureDial';
import PrecipitationMap from './components/PrecipitationMap';
import PrecipitationBlock from './components/PrecipitationBlock';
import * as Location from 'expo-location';
// Nota: removido `i18n-iso-countries` import en tiempo de ejecución para evitar
// que Metro intente resolver dinámicamente archivos de locales (./langs/*.json)
// y produzca errores en web. Se usa un pequeño mapa de fallback en su lugar.

// Nota: Todo local, sin librerías externas ni assets remotos. Usamos emoji como íconos.
const API_KEY = 'd68bf3bd84e3dae089856035155edd27';

export default function WeatherApp() {
  // estado
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // lista de 3h de OWM
  const [background, setBackground] = useState('#6fb1ff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const sugsTimer = useRef(null);
  const themeTimerRef = useRef(null);

  // carga inicial por GPS
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      await fetchWeatherByLocation(loc.coords.latitude, loc.coords.longitude);
    })();
    return () => {
      if (sugsTimer.current) clearTimeout(sugsTimer.current);
      if (themeTimerRef.current) clearTimeout(themeTimerRef.current);
    };
  }, []);

  // helpers
  const spanishDay = (d) => {
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return names[d.getDay()];
  };

  const spanishLongDay = (d) => {
    const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return names[d.getDay()];
  };

  const isNightFromWeather = (w) => {
    try {
      const tz = w?.timezone || 0; // segundos
      const nowUtc = Math.floor(Date.now() / 1000);
      const localNow = nowUtc + tz;
      const sr = w?.sys?.sunrise; // UTC
      const ss = w?.sys?.sunset;  // UTC
      if (!sr || !ss) return false;
      const srLocal = sr + tz;
      const ssLocal = ss + tz;
      return localNow < srLocal || localNow >= ssLocal;
    } catch { return false; }
  };

  const updateBackgroundFromWeather = (w) => {
    const main = w?.weather?.[0]?.main || '';
    const c = main.toLowerCase();
    const night = isNightFromWeather(w);
    if (night) return setBackground('#2c3e4f');
    if (c.includes('clear')) return setBackground('#6fb1ff');
    if (c.includes('cloud')) return setBackground('#74a6c8');
    if (c.includes('rain') || c.includes('drizzle')) return setBackground('#587a8a');
    if (c.includes('thunder')) return setBackground('#4d5e6b');
    if (c.includes('snow')) return setBackground('#a7c7ff');
    setBackground('#6fb1ff');
  };

  const scheduleThemeUpdate = (w) => {
    try {
      if (!w?.sys?.sunrise || !w?.sys?.sunset) return;
      if (themeTimerRef.current) clearTimeout(themeTimerRef.current);
      const nowUtc = Math.floor(Date.now() / 1000);
      const tz = w.timezone || 0;
      const localNow = nowUtc + tz;
      const srLocal = w.sys.sunrise + tz;
      const ssLocal = w.sys.sunset + tz;
      let next = localNow < srLocal ? srLocal : localNow < ssLocal ? ssLocal : srLocal + 24 * 3600;
      const delay = Math.max(1000, (next - localNow) * 1000);
      themeTimerRef.current = setTimeout(() => updateBackgroundFromWeather(w), delay);
    } catch {}
  };

  // Autocompletado por red (OWM Geocoding)
  const fetchWithTimeout = async (url, opts = {}, ms = 12000) => {
    const ctl = new AbortController();
    const id = setTimeout(() => ctl.abort(), ms);
    try { return await fetch(url, { ...opts, signal: ctl.signal }); }
    finally { clearTimeout(id); }
  };

  const fetchCitySuggestionsNet = async (name, countryCode) => {
    if (!name || name.trim().length < 2) { setSuggestions([]); return; }
    try {
      const q = countryCode && countryCode.length === 2 ? `${name.trim()},${countryCode}` : name.trim();
      const r = await fetchWithTimeout(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=6&appid=${API_KEY}`);
      const data = await r.json();
      if (!r.ok) throw new Error('No se pudo obtener sugerencias');
      const sugs = (data || []).map(it => ({ name: it.name, state: it.state, country: it.country, lat: it.lat, lon: it.lon }));
      setSuggestions(sugs);
    } catch (e) {
      if (e?.name === 'AbortError') setError('Tiempo de espera agotado buscando sugerencias.');
      else console.error(e);
      setSuggestions([]);
    }
  };

  const onCityChange = (val) => {
    setCity(val);
    if (sugsTimer.current) clearTimeout(sugsTimer.current);
    sugsTimer.current = setTimeout(() => fetchCitySuggestionsNet(val, country.trim().toUpperCase()), 350);
  };

  const onCountryChange = (val) => {
    setCountry(val);
    if (city.trim()) {
      if (sugsTimer.current) clearTimeout(sugsTimer.current);
      sugsTimer.current = setTimeout(() => fetchCitySuggestionsNet(city, val.trim().toUpperCase()), 350);
    }
  };

  const onPickSuggestion = async (s) => {
    setCity(s.name);
    setCountry(s.country);
    setSuggestions([]);
    await fetchWeatherByLocation(s.lat, s.lon);
  };

  // API
  const fetchWeatherByLocation = async (lat, lon) => {
    try {
      setError('');
      setLoading(true);
      const r = await fetchWithTimeout(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      const w = await r.json();
      if (!r.ok) throw new Error(mapApiError(w?.cod, w?.message));
  setWeather(w);
  updateBackgroundFromWeather(w);
  scheduleThemeUpdate(w);
      await fetchForecast(lat, lon);
    } catch (e) {
      console.error(e);
      setError(String(e.message || e));
    }
    finally { setLoading(false); }
  };

  const fetchWeather = async () => {
    const c = city.trim();
    const co = country.trim();
    if (!c) { setError('Ingresa una ciudad.'); return; }
    try {
      setLoading(true); setError('');
      // Primero usar geocoding para validar ciudad/país y obtener coords fiables
      const cc = countryCodeFromInput(co);
      const gq = cc ? `${c},${cc}` : c;
      const gr = await fetchWithTimeout(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(gq)}&limit=1&appid=${API_KEY}`);
      const gdata = await gr.json();
      if (!gr.ok) throw new Error('No se pudo validar la ciudad.');
      if (!Array.isArray(gdata) || gdata.length === 0) {
        if (cc) throw new Error(`No se encontró "${c}" en "${cc}".`);
        throw new Error('No se encontró la ciudad.');
      }
      const place = gdata[0];
      await fetchWeatherByLocation(place.lat, place.lon);
    } catch (e) {
      if (e?.name === 'AbortError') setError('Tiempo de espera agotado. Verifica tu conexión.');
      else {
        console.error(e);
        setError(String(e.message || e));
      }
    } finally { setLoading(false); }
  };

  const fetchForecast = async (lat, lon) => {
    // restaura función eliminada por error y evita ReferenceError
    try {
  setError('');
  const r = await fetchWithTimeout(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      const f = await r.json();
  if (!r.ok) throw new Error(mapApiError(f?.cod, f?.message));
      setForecast(f.list || []);
    } catch (e) {
      console.error(e);
  setError(String(e.message || e));
    }
  };

  // Derivados del pronóstico: próximos 7 días (min/máx)
  const daily = useMemo(() => {
    if (!forecast?.length) return [];
    const byDay = {};
    forecast.forEach((item) => {
      const d = new Date(item.dt * 1000);
      const key = d.toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { temps: [], weather: item.weather?.[0]?.main || '' };
      byDay[key].temps.push(item.main.temp);
    });
    return Object.entries(byDay)
      .slice(0, 7)
      .map(([date, v]) => {
        const d = new Date(date);
        const min = Math.round(Math.min(...v.temps));
        const max = Math.round(Math.max(...v.temps));
        return { date, day: spanishDay(d), min, max, weather: v.weather };
      });
  }, [forecast]);

  const to1 = (v) => (v === undefined || v === null ? '—' : Number(v).toFixed(1));
  const nowTemp = to1(weather?.main?.temp);
  const minT = to1(weather?.main?.temp_min);
  const maxT = to1(weather?.main?.temp_max);
  const feels = to1(weather?.main?.feels_like);
  const humidity = weather?.main?.humidity ?? 0;
  const pressure = weather?.main?.pressure ?? 0;
  const visibilityKm = weather?.visibility ? (weather.visibility / 1000).toFixed(1) : '—';
  const uvIndex = 2; // sin API UV: mostramos ejemplo local

  return (
    <View style={[styles.container, { backgroundColor: background }]}> 
      {/* Búsqueda compacta */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar ciudad"
          placeholderTextColor="#eaf1ff"
          style={styles.search}
          value={city}
          onChangeText={onCityChange}
          onSubmitEditing={fetchWeather}
          returnKeyType="search"
        />
        <TextInput
          placeholder="País (código o nombre)"
          placeholderTextColor="#eaf1ff"
          style={[styles.search, { flex: 0.9 }]}
          value={country}
          onChangeText={onCountryChange}
          onSubmitEditing={fetchWeather}
        />
        <Text style={styles.searchBtn} onPress={fetchWeather}>Buscar</Text>
      </View>
      {suggestions.length > 0 && (
        <View style={styles.suggestBox}>
          {suggestions.map((s, idx) => (
            <TouchableOpacity key={`${s.name}-${s.lat}-${idx}`} onPress={() => onPickSuggestion(s)}>
              <Text style={styles.suggestItem}>
                {s.name}{s.state ? `, ${s.state}` : ''} — {s.country}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Encabezado */}
      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

      <Animated.View style={[styles.header, { opacity: scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.75], extrapolate: 'clamp' }) }]}>
        <Text style={styles.city}>{weather?.name || '—'}</Text>
        <Text style={styles.subtitle}>{nowTemp}°  |  {weather?.weather?.[0]?.description || ''}</Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Resumen grande */}
        <View style={styles.bigTempWrap}>
          <Text style={styles.bigTemp}>{nowTemp}°</Text>
          <Text style={styles.bigSub}>Máxima: {maxT}°   Mínima: {minT}°</Text>
        </View>

        {/* Bloque: Ahora / próximas horas (simplificado con 6 entradas) */}
        {forecast?.length > 0 && (
          <View style={styles.cardBlock}>
            <Text style={styles.blockTitle}>Ahora</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {forecast.slice(0, 6).map((it, i) => {
                const hr = new Date(it.dt * 1000).getHours().toString().padStart(2, '0');
                return (
                  <View key={i} style={styles.hourItem}>
                    <Text style={styles.hourEmoji}>{iconFor(it.weather?.[0]?.main)}</Text>
                    <Text style={styles.hourTemp}>{to1(it.main.temp)}°</Text>
                    <Text style={styles.hourLabel}>{hr}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Pronóstico 7 días */}
        {daily.length > 0 && (
          <View style={styles.cardBlock}>
            <Text style={styles.blockTitle}>Pronóstico para los próximos 7 días</Text>
            {daily.map((d, idx) => (
              <View key={idx} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{idx === 0 ? 'Hoy' : d.day}</Text>
                <Text style={styles.dayEmoji}>{iconFor(d.weather)}</Text>
                <View style={styles.barFlex}>
                  {(() => {
                    const seg = segmentsFromTemp(d.min, d.max, daily);
                    return (
                      <>
                        <View style={[styles.seg, { flex: seg.left }]} />
                        <View style={[styles.segRange, { flex: seg.mid }]} />
                        <View style={[styles.seg, { flex: seg.right }]} />
                      </>
                    );
                  })()}
                </View>
                <Text style={styles.dayTemp}>{to1(d.max)}°</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tarjetas tipo iOS */}
        <View style={styles.grid}>
          {/* Viento con compás */}
          <GlassCard title="VIENTO 🧭">
            <View style={{ alignItems: 'center' }}>
              <WindCompass
                deg={weather?.wind?.deg || 0}
                speedKmh={(weather?.wind?.speed || 0) * 3.6}
                size={160}
              />
            </View>
          </GlassCard>

          <GlassCard title="ÍNDICE UV ☀️">
            <Text style={styles.metricBig}>{uvIndex}</Text>
            <Text style={styles.metricNote}>Bajo</Text>
            <View style={styles.uvScale}>
              <View style={[styles.uvFill, { width: `${(uvIndex / 11) * 100}%` }]} />
            </View>
            <Text style={styles.cardHint}>Usa protección solar de 09:00 a 17:00.</Text>
          </GlassCard>

          <GlassCard title="ATARDECER 🌇">
            <Text style={styles.metricBig}>{sunsetTime(weather)}</Text>
            <Text style={styles.cardHint}>Amanecer: {sunriseTime(weather)}</Text>
          </GlassCard>

          <GlassCard title="SENSACIÓN 🥵">
            <Text style={styles.metricBig}>{feels}°</Text>
            <Text style={styles.cardHint}>Más cálida debido a la humedad.</Text>
          </GlassCard>

          <GlassCard title="HUMEDAD 💧">
            <Text style={styles.metricBig}>{humidity}%</Text>
            <Text style={styles.cardHint}>Punto de rocío aprox.: {dewPoint(Number(nowTemp), humidity)}°</Text>
          </GlassCard>

          <GlassCard title="VISIBILIDAD 👁️">
            <Text style={styles.metricBig}>{visibilityKm} km</Text>
            <Text style={styles.cardHint}>Está completamente despejado.</Text>
          </GlassCard>

          <GlassCard title="PRESIÓN ⬆️">
            <PressureDial value={pressure} />
          </GlassCard>
        </View>

  <PrecipitationBlock lat={weather?.coord?.lat} lon={weather?.coord?.lon} tempC={Number(nowTemp)} />
        {loading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : null}
      </Animated.ScrollView>
    </View>
  );
}

// Componentes y utilidades
function GlassCard({ title, children }) {
  return (
    <View style={styles.cardGlass}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={{ marginTop: 4 }}>{children}</View>
    </View>
  );
}

function iconFor(main = '') {
  const c = main.toLowerCase();
  if (c.includes('clear')) return '☀️';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  return '🌤️';
}

function sunriseTime(weather) {
  const s = weather?.sys?.sunrise;
  if (!s) return '—';
  const d = new Date(s * 1000);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function sunsetTime(weather) {
  const s = weather?.sys?.sunset;
  if (!s) return '—';
  const d = new Date(s * 1000);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function dewPoint(t, h) {
  // aproximación rápida Magnus
  try {
    const a = 17.27, b = 237.7;
    const alpha = (a * t) / (b + t) + Math.log(h / 100);
    const dp = (b * alpha) / (a - alpha);
    return Math.round(dp);
  } catch {
    return '—';
  }
}

function pressureMarker(pressure) {
  // escala visual 980-1040 hPa
  const min = 980, max = 1040;
  const clamped = Math.max(min, Math.min(max, pressure || min));
  const pct = ((clamped - min) / (max - min)) * 100; // 0..100
  // línea tiene 100% width; marcador es 8px; devolvemos porcentaje con offset
  return `${pct}%`;
}

function mapApiError(code, message) {
  // Normaliza mensajes de OWM
  switch (String(code)) {
    case '404':
      return 'No se encontró la ciudad/país. Verifica la escritura.';
    case '400':
      return 'Parámetros inválidos en la búsqueda.';
    case '401':
      return 'API Key inválida o no autorizada.';
    case '429':
      return 'Límite de peticiones alcanzado. Intenta más tarde.';
    default:
      return message || 'Error al consultar el servicio meteorológico.';
  }
}

function countryCodeFromInput(input) {
  if (!input) return '';
  const t = input.trim();
  if (t.length === 2) return t.toUpperCase();
  const ccEs = countries.getAlpha2Code(t, 'es');
  if (ccEs) return ccEs.toUpperCase();
  const ccEn = countries.getAlpha2Code(t, 'en');
  if (ccEn) return ccEn.toUpperCase();
  // Fallback small map for common country names (normalized)
  const small = {
    'spain': 'ES', 'españa': 'ES', 'mexico': 'MX', 'méxico': 'MX', 'argentina': 'AR', 'chile': 'CL', 'peru': 'PE', 'perú': 'PE', 'colombia': 'CO', 'usa': 'US', 'estadosunidos': 'US', 'estados unidos': 'US', 'france': 'FR', 'francia': 'FR', 'germany': 'DE', 'alemania': 'DE', 'italy': 'IT', 'italia': 'IT', 'canada': 'CA', 'canadá': 'CA', 'brazil': 'BR', 'brasil': 'BR', 'uk': 'GB', 'reino unido': 'GB', 'portugal': 'PT', 'japon': 'JP', 'japón': 'JP'
  };
  const normalized = t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '');
  return small[normalized] || '';
}

function segmentsFromTemp(min, max, allDays) {
  // retorna proporciones para flex: [izq, mid, der]
  const mins = allDays.map((d) => d.min);
  const maxs = allDays.map((d) => d.max);
  const gMin = Math.min(...mins);
  const gMax = Math.max(...maxs);
  const left = Math.max(0, min - gMin);
  const mid = Math.max(1, max - min); // al menos 1 para que se vea
  const right = Math.max(0, gMax - max);
  return { left, mid, right };
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  search: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  searchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.35)',
    color: '#0b254a',
    fontWeight: '600',
  },
  suggestBox: { backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 12, paddingVertical: 4, marginBottom: 6 },
  suggestItem: { paddingVertical: 8, paddingHorizontal: 12, color: '#fff' },
  errorBox: { backgroundColor: 'rgba(255,0,0,0.25)', borderColor: 'rgba(255,0,0,0.4)', borderWidth: 1, padding: 8, borderRadius: 12, marginBottom: 8 },
  errorText: { color: '#fff' },
  header: { alignItems: 'center', marginBottom: 4 },
  city: { color: '#fff', fontSize: 32, fontWeight: '700', fontFamily: 'System' },
  subtitle: { color: '#e5f2ff', marginTop: 2, fontFamily: 'System' },
  scrollContent: { paddingBottom: 24 },
  bigTempWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  bigTemp: { fontSize: 80, color: '#fff', fontWeight: '200', fontFamily: 'System' },
  bigSub: { color: '#e5f2ff', fontFamily: 'System' },

  cardBlock: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
  },
  blockTitle: { color: '#eaf1ff', marginBottom: 8, fontWeight: '700' },
  hourItem: { alignItems: 'center', width: 48 },
  hourEmoji: { fontSize: 18, marginBottom: 4 },
  hourTemp: { color: '#fff', fontWeight: '600' },
  hourLabel: { color: '#eaf1ff', opacity: 0.9, marginTop: 2 },

  dayRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  dayLabel: { color: '#fff', width: 54 },
  dayEmoji: { width: 28, textAlign: 'center' },
  barFlex: { flex: 1, height: 8, marginHorizontal: 8, flexDirection: 'row', alignItems: 'center' },
  seg: { height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2 },
  segRange: { height: 6, backgroundColor: '#ffd56b', borderRadius: 3 },
  dayTemp: { color: '#fff', width: 40, textAlign: 'right' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  cardGlass: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20,
    padding: 12,
    marginVertical: 8,
  },
  cardTitle: { color: '#eaf1ff', fontWeight: '700', marginBottom: 6, fontFamily: 'System' },
  metricBig: { color: '#fff', fontSize: 28, fontWeight: '700', fontFamily: 'System' },
  metricNote: { color: '#eaf1ff', marginBottom: 6 },
  cardHint: { color: '#eaf1ff', marginTop: 6, fontSize: 12 },

  uvScale: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  uvFill: { height: '100%', backgroundColor: '#ff8a00' },

  pressureScale: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  scaleText: { color: '#eaf1ff' },
  scaleLine: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, position: 'relative' },
  scaleMarker: { position: 'absolute', width: 6, height: 10, backgroundColor: '#fff', top: -2, borderRadius: 2 },

  mapPlaceholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#2b3440',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
