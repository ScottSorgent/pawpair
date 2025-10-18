import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '@/constants/theme';
import { TodayVisit, VisitStatus } from '@/services/staff';
import { StatusBadge } from './StatusBadge';
import { X, Phone, Clock, ShieldCheck } from 'lucide-react-native';
import { Button } from './Button';
import { useRouter } from 'expo-router';

interface VisitDetailModalProps {
  visible: boolean;
  visit: TodayVisit | null;
  onClose: () => void;
  onStatusChange: (bookingId: string, newStatus: VisitStatus) => void;
}

export function VisitDetailModal({
  visible,
  visit,
  onClose,
  onStatusChange,
}: VisitDetailModalProps) {
  const router = useRouter();

  if (!visit) return null;

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CHECKED_OUT':
        return 'Checked Out';
      case 'RETURNED':
        return 'Returned';
      case 'NO_SHOW':
        return 'No Show';
      default:
        return status;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Visit Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pet Information</Text>
            <View style={styles.petSection}>
              <Image source={{ uri: visit.pet.photo }} style={styles.petPhoto} />
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{visit.pet.name}</Text>
                <Text style={styles.petId}>ID: {visit.pet.id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visitor Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{visit.user.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.value}>{visit.user.phone}</Text>
                <Phone size={16} color={colors.primary} />
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>User ID:</Text>
              <Text style={styles.value}>{visit.user.id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Booking ID:</Text>
              <Text style={styles.value}>{visit.bookingId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{visit.timeRange}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Current Status:</Text>
              <StatusBadge
                text={getStatusLabel(visit.status)}
                variant={
                  visit.status === 'CONFIRMED'
                    ? 'info'
                    : visit.status === 'CHECKED_OUT'
                    ? 'warning'
                    : visit.status === 'RETURNED'
                    ? 'success'
                    : 'error'
                }
              />
            </View>
          </View>

          {visit.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{visit.notes}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.safetyNote}
            onPress={() => {
              onClose();
              router.push('/safety-policies');
            }}
            activeOpacity={0.7}
          >
            <ShieldCheck size={20} color={colors.success} />
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Safety Reminder</Text>
              <Text style={styles.safetyText}>
                Verify photo ID on pickup; confirm leash/car restraint; log return time.
              </Text>
              <Text style={styles.safetyLink}>View full Safety & Policies →</Text>
            </View>
          </TouchableOpacity>

          {visit.statusHistory && visit.statusHistory.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status History</Text>
                {visit.statusHistory.map((history, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Clock size={16} color={colors.textSecondary} />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyStatus}>
                        {getStatusLabel(history.status)}
                      </Text>
                      <Text style={styles.historyTime}>
                        {formatTimestamp(history.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusButtons}>
              {visit.status !== 'CHECKED_OUT' && (
                <Button
                  title="Check Out"
                  onPress={() => {
                    onStatusChange(visit.bookingId, 'CHECKED_OUT');
                    onClose();
                  }}
                  variant="primary"
                />
              )}
              {visit.status === 'CHECKED_OUT' && (
                <Button
                  title="Mark Returned"
                  onPress={() => {
                    onStatusChange(visit.bookingId, 'RETURNED');
                    onClose();
                  }}
                  variant="primary"
                />
              )}
              {visit.status === 'CONFIRMED' && (
                <Button
                  title="Mark No Show"
                  onPress={() => {
                    onStatusChange(visit.bookingId, 'NO_SHOW');
                    onClose();
                  }}
                  variant="outline"
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  petSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  petId: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  safetyNote: {
    flexDirection: 'row',
    backgroundColor: colors.success + '10',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + '30',
    gap: 12,
    marginHorizontal: 16,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  safetyLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  statusButtons: {
    gap: 12,
  },
});
