import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Bell, MapPin, X } from 'lucide-react-native';
import { Button } from './Button';

interface PermissionExplainerProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function PermissionExplainer({ visible, onClose, onContinue }: PermissionExplainerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Permissions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              To provide the best experience, PawPair would like to use:
            </Text>

            <View style={styles.permissionItem}>
              <View style={styles.iconCircle}>
                <Bell size={24} color={colors.primary} />
              </View>
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>Notifications</Text>
                <Text style={styles.permissionDescription}>
                  Stay updated on booking confirmations, visit reminders, and messages from shelters.
                </Text>
              </View>
            </View>

            <View style={styles.permissionItem}>
              <View style={styles.iconCircle}>
                <MapPin size={24} color={colors.primary} />
              </View>
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>Location</Text>
                <Text style={styles.permissionDescription}>
                  Find shelters and available pets near you for easier visits.
                </Text>
              </View>
            </View>

            <Text style={styles.note}>
              You can change these permissions anytime in your device settings. We respect your privacy and only use your data to improve your experience.
            </Text>
          </View>

          <View style={styles.footer}>
            <Button title="Maybe Later" variant="ghost" onPress={onClose} style={styles.button} />
            <Button title="Continue" onPress={onContinue} style={styles.button} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  permissionItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
  },
});
