import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';

// Mapa local simple: un fondo oscuro y manchas que simulan lluvia alrededor de la ubicación
export default function PrecipitationMap({ width = 320, height = 180, lat, lon }) {
  // Generar manchas pseudo-aleatorias en base a lat/lon para que sean deterministas
  const spots = useMemo(() => {
    if (lat == null || lon == null) return [];
    const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
    const rnd = (i) => (Math.sin(seed + i * 1.3) * 0.5 + 0.5); // 0..1
    return new Array(12).fill(0).map((_, i) => ({
      x: rnd(i) * width,
      y: rnd(i + 1) * height,
      r: 8 + rnd(i + 2) * 16,
      a: 0.3 + rnd(i + 3) * 0.6,
    }));
  }, [lat, lon, width, height]);

  return (
    <View>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill="#2b3440" />
        {spots.map((s, idx) => (
          <Circle key={idx} cx={s.x} cy={s.y} r={s.r} fill={`rgba(86,155,255,${s.a})`} />
        ))}
        {/* ubicación */}
        {lat != null && lon != null ? (
          <Circle cx={width * 0.5} cy={height * 0.5} r={12} fill="#6fb1ff" />
        ) : null}
      </Svg>
    </View>
  );
}
