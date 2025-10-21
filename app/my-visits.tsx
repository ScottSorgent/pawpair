import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Toast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Edit, MessageSquare } from 'lucide-react-native';
import { booking as bookingService } from '@/services/booking';
import { pets as petsService } from '@/services/pets';
import { useStore } from '@/store/useStore';
import { Booking } from '@/types';

export default function MyVisits() {
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.list(user?.id || '1');

      const bookingsWithPets = await Promise.all(
        data.map(async (booking) => {
          try {
            const pet = await petsService.get(booking.petId);
            return { ...booking, pet };
          } catch (error) {
            console.error(`Failed to load pet ${booking.petId}:`, error);
            return booking;
          }
        })
      );

      setBookings(bookingsWithPets);
      setIsOffline(false);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      const errorMessage = error.message || 'Failed to load visits';
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('offline')) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (bookingId: string) => {
    showToast('Reschedule coming soon', 'info');
  };

  const handleCancel = (bookingId: string) => {
    showToast('Cancellation coming soon', 'info');
  };

  const handleProvideFeedback = (bookingId: string) => {
    router.push(`/post-visit-feedback?bookingId=${bookingId}`);
  };

  const handleMessageShelter = (bookingId: string) => {
    router.push('/chat-thread?threadId=thread-1');
  };

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => new Date(b.date) >= now);
  const pastBookings = bookings.filter((b) => new Date(b.date) < now);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderUpcomingBooking = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingIconContainer}>
          <Calendar size={24} color={colors.primary} />
        </View>
        <View style={styles.bookingHeaderInfo}>
          <Text style={styles.bookingTitle}>{booking.pet?.name || 'Pet Visit'}</Text>
          <Text style={styles.bookingStatus}>
            {booking.status === 'confirmed' && '✓ Confirmed'}
            {booking.status === 'pending' && '⏱ Pending'}
            {booking.status === 'cancelled' && '✕ Cancelled'}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetailRow}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.bookingDetailText}>
            {formatDate(new Date(booking.date))} at {booking.timeSlot}
          </Text>
        </View>
        <View style={styles.bookingDetailRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.bookingDetailText}>Shelter Visit</Text>
        </View>
      </View>

      <View style={styles.bookingActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleMessageShelter(booking.id)}
        >
          <MessageSquare size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReschedule(booking.id)}
        >
          <Edit size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={() => handleCancel(booking.id)}
        >
          <XCircle size={18} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPastBooking = (booking: Booking) => {
    const hasFeedback = Math.random() > 0.5;

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingIconContainer}>
            <Calendar size={24} color={colors.textSecondary} />
          </View>
          <View style={styles.bookingHeaderInfo}>
            <Text style={styles.bookingTitle}>{booking.pet?.name || 'Pet Visit'}</Text>
            <Text style={styles.bookingPastDate}>
              {formatDate(new Date(booking.date))}
            </Text>
          </View>
          {hasFeedback && (
            <View style={styles.feedbackBadge}>
              <CheckCircle size={16} color={colors.success} />
            </View>
          )}
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.bookingDetailRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.bookingDetailText}>Shelter Visit</Text>
          </View>
        </View>

        <View style={styles.bookingActions}>
          {!hasFeedback && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => handleProvideFeedback(booking.id)}
            >
              <Text style={styles.actionButtonTextPrimary}>Provide Feedback</Text>
            </TouchableOpacity>
          )}
          {hasFeedback && (
            <View style={styles.feedbackStatus}>
              <CheckCircle size={18} color={colors.success} />
              <Text style={styles.feedbackStatusText}>Feedback Submitted</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner visible={isOffline} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Visits</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon={Calendar}
          title="Unable to Load Visits"
          message={error}
          actionLabel="Retry"
          onAction={loadBookings}
        />
      ) : activeTab === 'upcoming' ? (
        upcomingBookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Upcoming Visits"
            message="You don't have any scheduled visits. Book a visit to meet your perfect pet!"
            actionLabel="Browse Pets"
            onAction={() => router.push('/home')}
          />
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {upcomingBookings.map(renderUpcomingBooking)}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )
      ) : (
        pastBookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Past Visits"
            message="You haven't completed any visits yet. Your visit history will appear here."
          />
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {pastBookings.map(renderPastBooking)}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookingHeaderInfo: {
    flex: 1,
  },
  bookingTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bookingStatus: {
    ...typography.bodySmall,
    color: colors.success,
  },
  bookingPastDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  feedbackBadge: {
    marginLeft: spacing.sm,
  },
  bookingDetails: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookingDetailText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtonDanger: {
    borderColor: colors.error + '30',
  },
  actionButtonTextDanger: {
    color: colors.error,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  actionButtonTextPrimary: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  feedbackStatusText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
