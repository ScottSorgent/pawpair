import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/theme';
import { Booking } from '@/services/staff';
import { StatusBadge } from './StatusBadge';
import { ChevronRight } from 'lucide-react-native';

interface BookingListItemProps {
  booking: Booking;
  onPress: (bookingId: string) => void;
}

export function BookingListItem({ booking, onPress }: BookingListItemProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'info';
      case 'CHECKED_OUT':
        return 'warning';
      case 'RETURNED':
        return 'success';
      case 'NO_SHOW':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(booking.bookingId)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image source={{ uri: booking.pet.photo }} style={styles.petPhoto} />
          <View style={styles.info}>
            <Text style={styles.petName}>{booking.pet.name}</Text>
            <Text style={styles.visitorName}>{booking.user.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.dateTime}>
                {formatDate(booking.date)} • {booking.timeRange}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <StatusBadge
            text={getStatusLabel(booking.status)}
            variant={getStatusVariant(booking.status)}
          />
          <ChevronRight size={20} color={colors.textSecondary} style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  petPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  visitorName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  chevron: {
    marginTop: 4,
  },
});
