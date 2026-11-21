import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';

interface LifeRadarChartProps {
  areaCompletionRates: Record<string, number>; // values 0.00 to 1.00
}

interface RadarAxis {
  key: string;
  label: string;
}

const RADAR_AXES: RadarAxis[] = [
  { key: 'item1', label: 'Morning' },
  { key: 'item2', label: 'Attendance' },
  { key: 'item3', label: 'Classes' },
  { key: 'item4', label: 'Discipline' },
  { key: 'item5', label: 'Social' },
  { key: 'item6', label: 'Learning' },
  { key: 'item7', label: 'Exercise' },
  { key: 'item8', label: 'Skills' },
  { key: 'item9', label: 'Recap' },
  { key: 'item10', label: 'Media' },
  { key: 'item11', label: 'Journal' },
  { key: 'item12', label: 'Sleep' },
];

export const LifeRadarChart: React.FC<LifeRadarChartProps> = ({ areaCompletionRates }) => {
  const size = 320;
  const center = size / 2;
  const radius = 95;
  const numAxes = RADAR_AXES.length;
  const angleStep = (2 * Math.PI) / numAxes;

  // Calculate coordinates on the circle
  const getCoordinates = (index: number, r: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Concentric polygon web lines at 25%, 50%, 75%, 100%
  const webLevels = [0.25, 0.5, 0.75, 1.0];
  const webPolygons = webLevels.map((lvl) => {
    return RADAR_AXES.map((_, i) => {
      const { x, y } = getCoordinates(i, radius * lvl);
      return `${x},${y}`;
    }).join(' ');
  });

  // Calculate actual data polygon points
  const dataPoints = RADAR_AXES.map((axis, i) => {
    const rate = Math.min(1, Math.max(0, areaCompletionRates[axis.key] ?? 0));
    // minimum radius so 0 still has a visible anchor point
    const r = Math.max(8, radius * rate);
    return getCoordinates(i, r);
  });

  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>12 Lifestyle Dimensions Radar</Text>
      <Text style={styles.chartSubtitle}>Polygon shape indicates balanced self-discipline</Text>

      <View style={styles.svgWrapper}>
        <Svg width={size} height={size}>
          {/* Concentric Web Grid */}
          {webPolygons.map((pts, idx) => (
            <Polygon
              key={`web-${idx}`}
              points={pts}
              fill={idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}
              stroke="#E2E8F0"
              strokeWidth={idx === webPolygons.length - 1 ? 1.5 : 1}
            />
          ))}

          {/* Radial Axis Lines */}
          {RADAR_AXES.map((_, i) => {
            const outer = getCoordinates(i, radius);
            return (
              <Line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#E2E8F0"
                strokeWidth={1}
              />
            );
          })}

          {/* User Data Polygon */}
          <Polygon
            points={dataPolygonString}
            fill="rgba(37, 99, 235, 0.25)"
            stroke="#2563EB"
            strokeWidth={2.5}
          />

          {/* Vertex Circles */}
          {dataPoints.map((pt, i) => (
            <Circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          ))}

          {/* Labels around perimeter */}
          {RADAR_AXES.map((axis, i) => {
            const labelCoord = getCoordinates(i, radius + 22);
            return (
              <G key={`label-${axis.key}`}>
                <SvgText
                  x={labelCoord.x}
                  y={labelCoord.y + 3}
                  fontSize={10}
                  fontWeight="bold"
                  fill="#475569"
                  textAnchor="middle">
                  {axis.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    textAlign: 'center',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LifeRadarChart;
