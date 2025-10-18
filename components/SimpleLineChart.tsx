import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/theme';

interface LineChartData {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: LineChartData[];
  title: string;
  suffix?: string;
}

export function SimpleLineChart({ data, title, suffix = '%' }: SimpleLineChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.chartContainer}>
          <View style={styles.lineContainer}>
            {data.map((item, index) => {
              const bottomPosition = ((item.value - min) / range) * 120;
              const nextItem = data[index + 1];

              return (
                <View key={index} style={styles.pointContainer}>
                  <View style={[styles.point, { bottom: bottomPosition }]}>
                    <View style={styles.pointDot} />
                    <Text style={styles.pointValue}>
                      {item.value}
                      {suffix}
                    </Text>
                  </View>
                  {nextItem && (
                    <View
                      style={[
                        styles.line,
                        {
                          bottom: bottomPosition,
                          height: Math.abs(
                            ((nextItem.value - min) / range) * 120 - bottomPosition
                          ),
                          transform: [
                            {
                              rotate:
                                nextItem.value > item.value ? '-45deg' : '45deg',
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.labelsContainer}>
            {data.map((item, index) => (
              <Text key={index} style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scrollView: {
    marginHorizontal: -8,
  },
  chartContainer: {
    paddingHorizontal: 8,
  },
  lineContainer: {
    flexDirection: 'row',
    height: 150,
    position: 'relative',
  },
  pointContainer: {
    width: 60,
    position: 'relative',
  },
  point: {
    position: 'absolute',
    left: 20,
    alignItems: 'center',
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  pointValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  line: {
    position: 'absolute',
    left: 24,
    width: 2,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  labelsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  label: {
    width: 60,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
