import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeatherDetails({ weather }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Clima</Text>
      <Text style={styles.detail}>Humedad: {weather.main.humidity}%</Text>
      <Text style={styles.detail}>Presión: {weather.main.pressure} hPa</Text>
      <Text style={styles.detail}>Viento: {weather.wind.speed} m/s</Text>
      <Text style={styles.detail}>Índice UV: {weather.uvi || 'N/A'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
});
