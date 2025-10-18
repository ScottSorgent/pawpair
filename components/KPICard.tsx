import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface KPICardProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function KPICard({ icon, label, value, change, changeType = 'neutral' }: KPICardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return colors.success;
      case 'negative':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {change && (
          <Text style={[styles.change, { color: getChangeColor() }]}>{change}</Text>
        )}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
