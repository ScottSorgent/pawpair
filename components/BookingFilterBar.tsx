import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors } from '@/constants/theme';
import { VisitStatus, BookingFilters } from '@/services/staff';
import { Search, Filter, X } from 'lucide-react-native';
import { useState } from 'react';

interface BookingFilterBarProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  onApply: () => void;
}

type DateRangePreset = 'today' | '7d' | '30d' | 'custom';

export function BookingFilterBar({ filters, onFiltersChange, onApply }: BookingFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<VisitStatus[]>(filters.status || []);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('today');

  const statusOptions: VisitStatus[] = ['CONFIRMED', 'CHECKED_OUT', 'RETURNED', 'NO_SHOW'];

  const handleStatusToggle = (status: VisitStatus) => {
    const updated = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(updated);
  };

  const handleDatePreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    const today = new Date().toISOString().split('T')[0];

    let dateFrom = '';
    let dateTo = today;

    if (preset === 'today') {
      dateFrom = today;
    } else if (preset === '7d') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      dateFrom = date.toISOString().split('T')[0];
    } else if (preset === '30d') {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      dateFrom = date.toISOString().split('T')[0];
    }

    onFiltersChange({
      ...filters,
      dateFrom,
      dateTo,
    });
  };

  const handleApply = () => {
    onFiltersChange({
      ...filters,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      search: searchQuery || undefined,
    });
    onApply();
    setShowFilters(false);
  };

  const handleClear = () => {
    setSelectedStatuses([]);
    setSearchQuery('');
    setDatePreset('today');
    onFiltersChange({});
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

  const activeFilterCount =
    (selectedStatuses.length > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (datePreset !== 'today' ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pet, visitor, or booking ID..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleApply}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.text} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.datePresets}>
                {(['today', '7d', '30d', 'custom'] as DateRangePreset[]).map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      datePreset === preset && styles.presetButtonActive,
                    ]}
                    onPress={() => handleDatePreset(preset)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        datePreset === preset && styles.presetButtonTextActive,
                      ]}
                    >
                      {preset === 'today' ? 'Today' : preset === '7d' ? 'Last 7 Days' : preset === '30d' ? 'Last 30 Days' : 'Custom'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    selectedStatuses.includes(status) && styles.statusChipActive,
                  ]}
                  onPress={() => handleStatusToggle(status)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      selectedStatuses.includes(status) && styles.statusChipTextActive,
                    ]}
                  >
                    {getStatusLabel(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  filtersPanel: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  datePresets: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  presetButtonTextActive: {
    color: colors.surface,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  statusChipTextActive: {
    color: colors.surface,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface,
  },
});
