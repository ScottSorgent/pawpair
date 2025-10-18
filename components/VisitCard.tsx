import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { colors } from '@/constants/theme';
import { TodayVisit, VisitStatus } from '@/services/staff';
import { StatusBadge } from './StatusBadge';
import { Phone, MessageCircle, MoreVertical, FileText } from 'lucide-react-native';
import { useState } from 'react';

interface VisitCardProps {
  visit: TodayVisit;
  onStatusChange: (bookingId: string, newStatus: VisitStatus) => void;
  onViewDetail: (bookingId: string) => void;
  onAddNote: (bookingId: string) => void;
}

export function VisitCard({ visit, onStatusChange, onViewDetail, onAddNote }: VisitCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return colors.info;
      case 'CHECKED_OUT':
        return colors.warning;
      case 'RETURNED':
        return colors.success;
      case 'NO_SHOW':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

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

  const handleCall = () => {
    setShowMenu(false);
    Linking.openURL(`tel:${visit.user.phone}`);
  };

  const handleMessage = () => {
    setShowMenu(false);
  };

  const handleViewDetail = () => {
    setShowMenu(false);
    onViewDetail(visit.bookingId);
  };

  const handleAddNote = () => {
    setShowMenu(false);
    onAddNote(visit.bookingId);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Image source={{ uri: visit.pet.photo }} style={styles.petPhoto} />
          <View style={styles.info}>
            <Text style={styles.petName}>{visit.pet.name}</Text>
            <Text style={styles.time}>{visit.timeRange}</Text>
            <Text style={styles.visitor}>{visit.user.name}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
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
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {visit.notes && (
        <View style={styles.notesSection}>
          <FileText size={14} color={colors.textSecondary} />
          <Text style={styles.notes}>{visit.notes}</Text>
        </View>
      )}

      {visit.status === 'CONFIRMED' && (
        <View style={styles.statusActions}>
          <TouchableOpacity
            style={[styles.statusButton, styles.checkOutButton]}
            onPress={() => onStatusChange(visit.bookingId, 'CHECKED_OUT')}
          >
            <Text style={styles.statusButtonText}>Check Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, styles.noShowButton]}
            onPress={() => onStatusChange(visit.bookingId, 'NO_SHOW')}
          >
            <Text style={[styles.statusButtonText, styles.noShowText]}>No Show</Text>
          </TouchableOpacity>
        </View>
      )}

      {visit.status === 'CHECKED_OUT' && (
        <View style={styles.statusActions}>
          <TouchableOpacity
            style={[styles.statusButton, styles.returnedButton]}
            onPress={() => onStatusChange(visit.bookingId, 'RETURNED')}
          >
            <Text style={styles.statusButtonText}>Mark Returned</Text>
          </TouchableOpacity>
        </View>
      )}

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleCall}>
            <Phone size={18} color={colors.text} />
            <Text style={styles.menuItemText}>Call Visitor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleMessage}>
            <MessageCircle size={18} color={colors.text} />
            <Text style={styles.menuItemText}>Message Thread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleViewDetail}>
            <FileText size={18} color={colors.text} />
            <Text style={styles.menuItemText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleAddNote}>
            <FileText size={18} color={colors.text} />
            <Text style={styles.menuItemText}>Add Note</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  petPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  visitor: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuButton: {
    padding: 4,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  notes: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOutButton: {
    backgroundColor: colors.warning,
  },
  returnedButton: {
    backgroundColor: colors.success,
  },
  noShowButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  noShowText: {
    color: colors.error,
  },
  menu: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.text,
  },
});
