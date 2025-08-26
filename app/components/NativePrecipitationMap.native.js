import React from 'react';
import { View, Text, Platform } from 'react-native';
let MapView, UrlTile, Marker, PROVIDER_GOOGLE;

function ensureRNMaps() {
  if (!MapView) {
    // lazy require so static bundlers for web don't pick up native-only module
    // eslint-disable-next-line global-require
    const RNM = require('react-native-maps');
    MapView = RNM.default || RNM;
    UrlTile = RNM.UrlTile;
    Marker = RNM.Marker;
    PROVIDER_GOOGLE = RNM.PROVIDER_GOOGLE;
  }
}

export default function NativePrecipitationMap({ lat, lon, tempC }) {
  ensureRNMaps();
  if (!(typeof lat === 'number' && typeof lon === 'number')) {
    return <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff' }}>Ubicación no disponible</Text>
    </View>;
  }
  const region = { latitude: lat, longitude: lon, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  const tileUrl = 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=d68bf3bd84e3dae089856035155edd27';

  return (
    <View style={{ height: 180, borderRadius: 12, overflow: 'hidden' }}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsCompass={false}
      >
        <UrlTile urlTemplate={tileUrl} maximumZ={19} zIndex={2} tileSize={256} />
        <Marker coordinate={{ latitude: lat, longitude: lon }}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>{tempC}\u00B0C</Text>
          </View>
        </Marker>
      </MapView>
    </View>
  );
}
