import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface TagProps {
  label: string;
  variant?: TagVariant;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Tag({ label, variant = 'default', selected = false, onPress, style, textStyle }: TagProps) {
  const effectiveVariant = selected ? 'primary' : variant;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.tag, styles[effectiveVariant], selected && styles.selected, style]}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, styles[`${effectiveVariant}Text`], textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.tag, styles[effectiveVariant], selected && styles.selected, style]}>
      <Text style={[styles.text, styles[`${effectiveVariant}Text`], textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
  },
  default: {
    backgroundColor: colors.background,
  },
  primary: {
    backgroundColor: colors.primaryLight + '20',
  },
  success: {
    backgroundColor: colors.success + '20',
  },
  warning: {
    backgroundColor: colors.warning + '20',
  },
  error: {
    backgroundColor: colors.error + '20',
  },
  info: {
    backgroundColor: colors.info + '20',
  },
  text: {
    ...typography.caption,
    fontWeight: '500',
  },
  defaultText: {
    color: colors.textSecondary,
  },
  primaryText: {
    color: colors.primary,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
  infoText: {
    color: colors.info,
  },
});
