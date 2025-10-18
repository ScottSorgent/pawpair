import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/constants/theme';
import { staff, TodayVisit, VisitStatus } from '@/services/staff';
import { VisitCard } from '@/components/VisitCard';
import { VisitDetailModal } from '@/components/VisitDetailModal';
import { EmptyState } from '@/components/EmptyState';
import { Toast } from '@/components/Toast';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MoreVertical, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function StaffDashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visits, setVisits] = useState<TodayVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<TodayVisit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadVisits();
  }, [selectedDate]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await staff.getTodayVisits(selectedDate);
      setVisits(data);
    } catch (error) {
      setToast({ message: 'Failed to load visits', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: VisitStatus) => {
    try {
      await staff.updateVisitStatus(bookingId, newStatus, 'staff-001');

      setVisits((prev) =>
        prev.map((visit) =>
          visit.bookingId === bookingId ? { ...visit, status: newStatus } : visit
        )
      );

      const statusLabel = newStatus === 'CHECKED_OUT'
        ? 'checked out'
        : newStatus === 'RETURNED'
        ? 'returned'
        : 'marked as no show';

      setToast({ message: `Visit ${statusLabel} successfully`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleViewDetail = (bookingId: string) => {
    const visit = visits.find((v) => v.bookingId === bookingId);
    if (visit) {
      setSelectedVisit(visit);
      setShowDetailModal(true);
    }
  };

  const handleAddNote = (bookingId: string) => {
    Alert.prompt(
      'Add Note',
      'Enter a note for this visit:',
      async (text) => {
        if (text) {
          try {
            await staff.addVisitNote(bookingId, text);
            setVisits((prev) =>
              prev.map((visit) =>
                visit.bookingId === bookingId ? { ...visit, notes: text } : visit
              )
            );
            setToast({ message: 'Note added successfully', type: 'success' });
          } catch (error) {
            setToast({ message: 'Failed to add note', type: 'error' });
          }
        }
      }
    );
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Visits</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => Alert.alert('Create Booking', 'Feature coming soon')}
          >
            <Plus size={20} color={colors.surface} />
            <Text style={styles.createButtonText}>Create Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.overflowButton}
            onPress={() => setShowOverflowMenu(!showOverflowMenu)}
          >
            <MoreVertical size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showOverflowMenu && (
        <View style={styles.overflowMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowOverflowMenu(false);
              router.push('/staff-background-checks');
            }}
          >
            <Shield size={20} color={colors.text} />
            <Text style={styles.menuItemText}>Background Checks</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={handlePreviousDay}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {!isToday && (
            <TouchableOpacity onPress={handleToday}>
              <Text style={styles.todayButton}>Jump to Today</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={handleNextDay}>
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={64} color={colors.textSecondary} />}
          title="No visits scheduled"
          message={isToday ? "No visits scheduled for today." : "No visits scheduled for this day."}
          actionLabel="View All Bookings"
          onAction={() => router.push('/(staff-tabs)/bookings')}
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {visits.map((visit) => (
            <VisitCard
              key={visit.bookingId}
              visit={visit}
              onStatusChange={handleStatusChange}
              onViewDetail={handleViewDetail}
              onAddNote={handleAddNote}
            />
          ))}
        </ScrollView>
      )}

      <VisitDetailModal
        visible={showDetailModal}
        visit={selectedVisit}
        onClose={() => setShowDetailModal(false)}
        onStatusChange={handleStatusChange}
      />

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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overflowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overflowMenu: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  createButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateButton: {
    padding: 8,
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  todayButton: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
});
