import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { staff, Booking, BookingFilters } from '@/services/staff';
import { BookingFilterBar } from '@/components/BookingFilterBar';
import { BookingListItem } from '@/components/BookingListItem';
import { BookingSkeleton } from '@/components/BookingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Calendar as CalendarIcon, MoreVertical } from 'lucide-react-native';

export default function StaffBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookingFilters>({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  });
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await staff.getBookings(filters);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadBookings();
  };

  const handleBookingPress = (bookingId: string) => {
    router.push({
      pathname: '/booking-detail',
      params: { bookingId },
    });
  };

  const handleBulkAction = (action: 'returned' | 'no-show') => {
    setShowBulkMenu(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Bookings</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowBulkMenu(!showBulkMenu)}
        >
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {showBulkMenu && (
        <View style={styles.bulkMenu}>
          <TouchableOpacity
            style={styles.bulkMenuItem}
            onPress={() => handleBulkAction('returned')}
          >
            <Text style={styles.bulkMenuText}>Mark Selected as Returned</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkMenuItem}
            onPress={() => handleBulkAction('no-show')}
          >
            <Text style={styles.bulkMenuText}>Mark Selected as No Show</Text>
          </TouchableOpacity>
        </View>
      )}

      <BookingFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
      />

      {loading ? (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <BookingSkeleton key={i} />
          ))}
        </ScrollView>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={64} color={colors.textSecondary} />}
          title="No bookings found"
          message="Try adjusting your filters to see more bookings."
          actionLabel="Clear Filters"
          onAction={() => {
            setFilters({
              dateFrom: new Date().toISOString().split('T')[0],
              dateTo: new Date().toISOString().split('T')[0],
            });
            loadBookings();
          }}
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsCount}>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
          </Text>
          {bookings.map((booking) => (
            <BookingListItem
              key={booking.bookingId}
              booking={booking}
              onPress={handleBookingPress}
            />
          ))}
        </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  menuButton: {
    padding: 8,
  },
  bulkMenu: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bulkMenuItem: {
    paddingVertical: 12,
  },
  bulkMenuText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
});
