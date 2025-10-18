import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { staff, ReportsData } from '@/services/staff';
import { KPICard } from '@/components/KPICard';
import { SimpleBarChart } from '@/components/SimpleBarChart';
import { SimpleLineChart } from '@/components/SimpleLineChart';
import { TopPetsList } from '@/components/TopPetsList';
import {
  Calendar,
  TrendingUp,
  XCircle,
  Star,
  Download,
  Share2,
  ChevronDown,
  MoreVertical,
  Shield,
} from 'lucide-react-native';

type DateRange = 4 | 8 | 12;

export default function StaffReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(8);
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await staff.getReports(dateRange);
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    loadReports(true);
  };

  const calculateKPIs = () => {
    if (!reports) return null;

    const thisWeekVisits =
      reports.visitsPerWeek[reports.visitsPerWeek.length - 1]?.count || 0;
    const lastWeekVisits =
      reports.visitsPerWeek[reports.visitsPerWeek.length - 2]?.count || 0;

    const avgFeedback =
      reports.feedbackRate.reduce((sum, item) => sum + (item.submittedPct || 0), 0) /
      reports.feedbackRate.length;

    const avgNoShow =
      reports.noShowRate.reduce((sum, item) => sum + (item.pct || 0), 0) /
      reports.noShowRate.length;

    const avgRating =
      reports.topPets.reduce((sum, pet) => sum + pet.avgRating, 0) / reports.topPets.length;

    return {
      thisWeekVisits,
      lastWeekVisits,
      avgFeedback: Math.round(avgFeedback),
      avgNoShow: Math.round(avgNoShow),
      avgRating: avgRating.toFixed(1),
    };
  };

  const handleExport = () => {
    Alert.alert('Export CSV', 'CSV export feature coming soon!');
  };

  const handleShare = () => {
    Alert.alert('Share Snapshot', 'Share snapshot feature coming soon!');
  };

  const kpis = calculateKPIs();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!reports || !kpis) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load reports</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.rangeButton}
            onPress={() => setShowRangeSelector(!showRangeSelector)}
          >
            <Text style={styles.rangeButtonText}>Last {dateRange} weeks</Text>
            <ChevronDown size={16} color={colors.text} />
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
          <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
            <Download size={20} color={colors.text} />
            <Text style={styles.menuItemText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
            <Share2 size={20} color={colors.text} />
            <Text style={styles.menuItemText}>Share Snapshot</Text>
          </TouchableOpacity>
        </View>
      )}

      {showRangeSelector && (
        <View style={styles.rangeSelectorPanel}>
          {([4, 8, 12] as DateRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeOption,
                dateRange === range && styles.rangeOptionActive,
              ]}
              onPress={() => {
                setDateRange(range);
                setShowRangeSelector(false);
              }}
            >
              <Text
                style={[
                  styles.rangeOptionText,
                  dateRange === range && styles.rangeOptionTextActive,
                ]}
              >
                Last {range} weeks
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.kpiGrid}>
          <View style={styles.kpiItem}>
            <KPICard
              icon={<Calendar size={24} color={colors.primary} />}
              label="This Week Visits"
              value={kpis.thisWeekVisits}
              change={`${kpis.thisWeekVisits - kpis.lastWeekVisits > 0 ? '+' : ''}${kpis.thisWeekVisits - kpis.lastWeekVisits} vs last week`}
              changeType={
                kpis.thisWeekVisits > kpis.lastWeekVisits ? 'positive' : 'negative'
              }
            />
          </View>
          <View style={styles.kpiItem}>
            <KPICard
              icon={<TrendingUp size={24} color={colors.success} />}
              label="Feedback Rate"
              value={`${kpis.avgFeedback}%`}
            />
          </View>
          <View style={styles.kpiItem}>
            <KPICard
              icon={<XCircle size={24} color={colors.error} />}
              label="No-Show Rate"
              value={`${kpis.avgNoShow}%`}
            />
          </View>
          <View style={styles.kpiItem}>
            <KPICard
              icon={<Star size={24} color={colors.warning} />}
              label="Avg Rating"
              value={kpis.avgRating}
            />
          </View>
        </View>

        <SimpleBarChart
          title="Visits Per Week"
          data={reports.visitsPerWeek.map((item) => ({
            label: item.weekLabel,
            value: item.count || 0,
          }))}
        />

        <SimpleLineChart
          title="Feedback Submission Rate"
          data={reports.feedbackRate.map((item) => ({
            label: item.weekLabel,
            value: item.submittedPct || 0,
          }))}
          suffix="%"
        />

        <TopPetsList title="Top Pets by Visits" pets={reports.topPets} />

        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>Export & Share</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <Download size={20} color={colors.primary} />
              <Text style={styles.exportButtonText}>Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={handleShare}>
              <Share2 size={20} color={colors.primary} />
              <Text style={styles.exportButtonText}>Share Snapshot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  rangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  rangeSelectorPanel: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 16,
    gap: 8,
  },
  rangeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rangeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  rangeOptionTextActive: {
    color: colors.surface,
    fontWeight: '600',
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
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  kpiItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  exportSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
