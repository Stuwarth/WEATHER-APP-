import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export default function PressureDial({ value = 1013, min = 980, max = 1040, width = 180, height = 120 }) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = Math.PI * (1 - pct); // 0 -> derecha, 1 -> izquierda

  const cx = width / 2;
  const cy = height;
  const r = width / 2 - 8;

  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;

  const arcPath = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
  const needleX = cx + r * Math.cos(angle);
  const needleY = cy - r * Math.sin(angle);

  return (
    <View>
      <Svg width={width} height={height + 10}>
        <Path d={arcPath} stroke="rgba(255,255,255,0.35)" strokeWidth={6} fill="none" />
        <Path d={arcPath} stroke="#9ad0ff" strokeWidth={6} fill="none" strokeDasharray="6 6" />
        <Circle cx={needleX} cy={needleY} r={5} fill="#fff" />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(value)}</Text>
        <Text style={styles.unit}>hPa</Text>
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>Baja</Text>
        <Text style={styles.label}>Alta</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 36, left: 0, right: 0, alignItems: 'center' },
  value: { color: '#fff', fontSize: 24, fontWeight: '700' },
  unit: { color: '#eaf1ff' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 8, marginTop: 4 },
  label: { color: '#eaf1ff' },
});
