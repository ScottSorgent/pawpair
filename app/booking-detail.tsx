import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/theme';
import { staff, Booking, VisitStatus } from '@/services/staff';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Edit3,
  Save,
} from 'lucide-react-native';

export default function BookingDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const data = await staff.getBookingDetail(bookingId);
      setBooking(data);
      setNotes(data?.notes || '');
    } catch (error) {
      setToast({ message: 'Failed to load booking', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: VisitStatus) => {
    if (!booking) return;

    try {
      await staff.updateBookingStatus(booking.bookingId, newStatus, 'staff-001');
      setBooking({ ...booking, status: newStatus });
      setToast({ message: `Status updated to ${getStatusLabel(newStatus)}`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleSaveNotes = async () => {
    if (!booking) return;

    try {
      await staff.updateBookingNotes(booking.bookingId, notes);
      setBooking({ ...booking, notes });
      setEditingNotes(false);
      setToast({ message: 'Notes saved successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to save notes', type: 'error' });
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
    }
  };

  const getStatusVariant = (status: VisitStatus) => {
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(booking.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{booking.timeRange}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Location:</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.infoValue}>{booking.shelter.name}</Text>
                <Text style={styles.locationAddress}>{booking.shelter.location}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking ID:</Text>
              <Text style={styles.infoValue}>{booking.bookingId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet</Text>
          <View style={styles.petCard}>
            <Image source={{ uri: booking.pet.photo }} style={styles.petPhoto} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{booking.pet.name}</Text>
              {booking.pet.breed && (
                <Text style={styles.petBreed}>{booking.pet.breed}</Text>
              )}
              <Text style={styles.petId}>ID: {booking.pet.id}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visitor</Text>
          <View style={styles.visitorCard}>
            <View style={styles.visitorInfo}>
              <Text style={styles.visitorName}>{booking.user.name}</Text>
              <Text style={styles.visitorDetail}>{booking.user.phone}</Text>
              {booking.user.email && (
                <Text style={styles.visitorDetail}>{booking.user.email}</Text>
              )}
              <Text style={styles.visitorId}>ID: {booking.user.id}</Text>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${booking.user.phone}`)}
              >
                <Phone size={18} color={colors.primary} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MessageCircle size={18} color={colors.primary} />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {booking.statusHistory.map((entry, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < booking.statusHistory.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <StatusBadge
                    text={getStatusLabel(entry.status)}
                    variant={getStatusVariant(entry.status)}
                  />
                  <Text style={styles.timelineTime}>{formatTimestamp(entry.timestamp)}</Text>
                  <Text style={styles.timelineStaff}>by {entry.staffName}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Internal Notes</Text>
            {!editingNotes ? (
              <TouchableOpacity onPress={() => setEditingNotes(true)}>
                <Edit3 size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSaveNotes}>
                <Save size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {editingNotes ? (
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add internal notes about this booking..."
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <View style={styles.notesDisplay}>
              <Text style={styles.notesText}>
                {booking.notes || 'No notes added yet'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            {booking.status !== 'CHECKED_OUT' && booking.status !== 'RETURNED' && (
              <Button
                title="Check Out"
                onPress={() => handleStatusChange('CHECKED_OUT')}
                variant="primary"
              />
            )}
            {booking.status === 'CHECKED_OUT' && (
              <Button
                title="Mark Returned"
                onPress={() => handleStatusChange('RETURNED')}
                variant="primary"
              />
            )}
            {booking.status === 'CONFIRMED' && (
              <Button
                title="Mark No Show"
                onPress={() => handleStatusChange('NO_SHOW')}
                variant="outline"
              />
            )}
          </View>
        </View>
      </ScrollView>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={true}
          onHide={() => setToast(null)}
        />
      )}
    </View>
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
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  petCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
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
  petBreed: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  petId: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  visitorCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  visitorInfo: {
    marginBottom: 12,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  visitorDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  visitorId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  timelineStaff: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notesDisplay: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionsGrid: {
    gap: 12,
  },
});
