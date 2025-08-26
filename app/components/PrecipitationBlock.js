import React from 'react';
import { View, Text } from 'react-native';
import PrecipitationMap from './PrecipitationMap';

export default function PrecipitationBlock({ lat, lon }) {
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
      <PrecipitationMap width={320} height={180} lat={lat} lon={lon} />
    </View>
  );
}
