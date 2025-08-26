import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ActivityIndicator, Image, Alert } from 'react-native';

const API_KEY = 'd68bf3bd84e3dae089856035155edd27'; // Reemplaza con tu API Key de OpenWeatherMap

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    Keyboard.dismiss();
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
      } else {
        setError(data.message || 'Ciudad no encontrada');
      }
    } catch (e) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const getWeatherIcon = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}@4x.png`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa una ciudad"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={fetchWeather}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.button} onPress={fetchWeather}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {weather && (
        <View style={styles.weatherBox}>
          <Text style={styles.city}>{weather.name}, {weather.sys.country}</Text>
          <Image
            source={{ uri: getWeatherIcon(weather.weather[0].icon) }}
            style={styles.icon}
          />
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <Text style={styles.minmax}>Máx: {Math.round(weather.main.temp_max)}°C  Mín: {Math.round(weather.main.temp_min)}°C</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#007AFF',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontSize: 16,
  },
  weatherBox: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  icon: {
    width: 100,
    height: 100,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#222',
    marginVertical: 10,
  },
  desc: {
    fontSize: 20,
    color: '#555',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  minmax: {
    fontSize: 16,
    color: '#888',
  },
});
