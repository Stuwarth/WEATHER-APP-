import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

export default function WindCompass({ deg = 0, speedKmh = 0, size = 160 }) {
  const c = size / 2;
  const r = c - 10;
  const rad = ((deg - 90) * Math.PI) / 180; // rotar para que 0° apunte arriba
  const x = c + r * Math.cos(rad);
  const y = c + r * Math.sin(rad);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {/* anillos */}
        <Circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.35)" strokeWidth={2} fill="none" />
        <Circle cx={c} cy={c} r={r - 10} stroke="rgba(255,255,255,0.25)" strokeWidth={1} fill="none" strokeDasharray="4 6" />

        {/* marcas cardinales */}
        <SvgText x={c} y={18} fill="#eaf1ff" fontSize="12" textAnchor="middle">N</SvgText>
        <SvgText x={size - 18} y={c + 4} fill="#eaf1ff" fontSize="12" textAnchor="middle">E</SvgText>
        <SvgText x={c} y={size - 6} fill="#eaf1ff" fontSize="12" textAnchor="middle">S</SvgText>
        <SvgText x={18} y={c + 4} fill="#eaf1ff" fontSize="12" textAnchor="middle">O</SvgText>

        {/* aguja */}
        <Line x1={c} y1={c} x2={x} y2={y} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
        <Circle cx={c} cy={c} r={6} fill="#ffffff" />
      </Svg>
      <View style={styles.centerLabel} pointerEvents="none">
        <Text style={styles.speed}>{Math.round(speedKmh)}</Text>
        <Text style={styles.unit}>km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  centerLabel: { position: 'absolute', alignItems: 'center' },
  speed: { color: '#fff', fontSize: 22, fontWeight: '700' },
  unit: { color: '#eaf1ff', marginTop: -4 },
});
