import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/theme';

interface BarChartData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  title: string;
  maxValue?: number;
}

export function SimpleBarChart({ data, title, maxValue }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.chartContainer}>
          {data.map((item, index) => {
            const height = (item.value / max) * 150;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <Text style={styles.barValue}>{item.value}</Text>
                  <View style={[styles.bar, { height: Math.max(height, 20) }]} />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    gap: 12,
  },
  barContainer: {
    alignItems: 'center',
    width: 60,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 170,
  },
  bar: {
    width: 40,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginTop: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
