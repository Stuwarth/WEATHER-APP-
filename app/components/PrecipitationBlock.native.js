import React from 'react';
import { View, Text } from 'react-native';
import NativePrecipitationMap from './NativePrecipitationMap';

export default function PrecipitationBlock({ lat, lon, tempC }) {
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderColor: 'rgba(255,255,255,0.35)',
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      marginVertical: 8,
    }}>
      <Text style={{ color: '#eaf1ff', marginBottom: 8, fontWeight: '700' }}>Precipitación</Text>
      {typeof lat === 'number' && typeof lon === 'number' ? (
        <NativePrecipitationMap lat={lat} lon={lon} tempC={tempC} />
      ) : (
        <View style={{ height: 180, borderRadius: 12, backgroundColor: '#2b3440', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff' }}>Ubicación no disponible</Text>
        </View>
      )}
    </View>
  );
}
