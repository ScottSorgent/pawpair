import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { X } from 'lucide-react-native';
import { Button } from './Button';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectSlot: (slot: TimeSlot) => void;
  slots: TimeSlot[];
  selectedSlot?: TimeSlot;
}

export function TimeSlotPicker({
  visible,
  onClose,
  onSelectSlot,
  slots,
  selectedSlot,
}: TimeSlotPickerProps) {
  const [tempSelectedSlot, setTempSelectedSlot] = useState<TimeSlot | undefined>(selectedSlot);

  const handleSlotPress = (slot: TimeSlot) => {
    if (!slot.available) return;
    setTempSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (tempSelectedSlot) {
      onSelectSlot(tempSelectedSlot);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Time Slot</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const isSelected = tempSelectedSlot?.id === slot.id;
                const isDisabled = !slot.available;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotButton,
                      isSelected && styles.selectedSlot,
                      isDisabled && styles.disabledSlot,
                    ]}
                    onPress={() => handleSlotPress(slot)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.selectedSlotText,
                        isDisabled && styles.disabledSlotText,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Cancel" variant="ghost" onPress={onClose} style={styles.button} />
            <Button
              title="Confirm"
              onPress={handleConfirm}
              disabled={!tempSelectedSlot}
              style={styles.button}
            />
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
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
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  slotButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledSlot: {
    opacity: 0.4,
  },
  slotText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  selectedSlotText: {
    color: colors.surface,
    fontWeight: '600',
  },
  disabledSlotText: {
    color: colors.textSecondary,
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
