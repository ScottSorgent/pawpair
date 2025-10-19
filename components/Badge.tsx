import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';
import { ReactElement } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'submitted' | 'approved' | 'rejected';

interface BadgeProps {
  count?: number;
  max?: number;
  style?: ViewStyle;
  variant?: BadgeVariant;
  label?: string;
  children?: string;
  icon?: ReactElement | null;
}

export function Badge({ count, max = 99, style, variant = 'default', label, children, icon }: BadgeProps) {
  if (count !== undefined && count <= 0) return null;

  const displayText = children || label || (count !== undefined ? (count > max ? `${max}+` : count.toString()) : '');

  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'error':
        return styles.error;
      case 'info':
        return styles.info;
      case 'pending':
        return styles.pending;
      case 'submitted':
        return styles.submitted;
      case 'approved':
        return styles.approved;
      case 'rejected':
        return styles.rejected;
      default:
        return styles.default;
    }
  };

  return (
    <View style={[styles.badge, getVariantStyle(), style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.text}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.xs / 2,
  },
  default: {
    backgroundColor: colors.error,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  error: {
    backgroundColor: colors.error,
  },
  info: {
    backgroundColor: colors.info,
  },
  pending: {
    backgroundColor: colors.warning,
  },
  submitted: {
    backgroundColor: colors.info,
  },
  approved: {
    backgroundColor: colors.success,
  },
  rejected: {
    backgroundColor: colors.error,
  },
  text: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },
});
