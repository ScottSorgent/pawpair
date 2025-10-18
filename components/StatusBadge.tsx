import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  text: string;
  variant?: BadgeVariant;
}

export function StatusBadge({ text, variant = 'default' }: StatusBadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return `${colors.success}20`;
      case 'warning':
        return `${colors.warning}20`;
      case 'error':
        return `${colors.error}20`;
      case 'info':
        return `${colors.info}20`;
      default:
        return colors.border;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
