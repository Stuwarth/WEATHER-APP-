import React from 'react';
import { View, Text } from 'react-native';

export const PROVIDER_GOOGLE = undefined;

export function UrlTile() {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}
export function Marker({ children }) {
  return (
    <View style={{ padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 6 }}>
      {children || <Text style={{ color: '#fff' }}>Marker</Text>}
    </View>
  );
}

export default function MapView({ children, style }) {
  return (
    <View style={style}>
      <View style={{ flex: 1, backgroundColor: '#2b3440', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>Mapa (mock para web)</Text>
      </View>
      {children}
    </View>
  );
}
