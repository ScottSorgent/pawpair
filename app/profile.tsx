import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Toast } from '@/components/Toast';
import {
  User,
  Settings,
  MapPin,
  Bell,
  Car,
  PawPrint,
  Accessibility,
  Download,
  Trash2,
  Award,
  Calendar,
  Code,
} from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { profile as profileService } from '@/services/profile';
import { rewards as rewardsService } from '@/services/rewards';
import { booking as bookingService } from '@/services/booking';
import { auth } from '@/services/auth';

export default function Profile() {
  const router = useRouter();
  const { user, profile, setProfile, clearStore } = useStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalVisits: 0, completedVisits: 0 });
  const [userRewards, setUserRewards] = useState<any>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ visible: false, message: '', type: 'info' });

  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    petUpdates: true,
    messageAlerts: true,
    weeklyDigest: false,
  });

  const [accessibility, setAccessibility] = useState({
    largeText: false,
    highContrast: false,
    screenReader: false,
  });

  const [transportOptions, setTransportOptions] = useState({
    car: true,
    publicTransit: false,
    walking: false,
    bike: false,
  });

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const [profileData, rewardsData, bookingsData] = await Promise.all([
        profileService.get(user.id),
        rewardsService.get(user.id).catch(() => null),
        bookingService.list(user.id).catch(() => []),
      ]);

      setProfile(profileData);
      setUserRewards(rewardsData);

      const completed = bookingsData.filter((b) => b.status === 'completed').length;
      setStats({
        totalVisits: bookingsData.length,
        completedVisits: completed,
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleRetakeProfileSetup = () => {
    router.push('/profile-setup-intro');
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        user,
        profile,
        stats,
        rewards: userRewards,
        exportedAt: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      showToast('Data exported to console (download functionality coming soon)', 'info');
      console.log('Exported Data:', jsonString);
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              clearStore();
              showToast('Account deletion initiated. You have been signed out.', 'success');
              setTimeout(() => {
                router.replace('/');
              }, 1500);
            } catch (error: any) {
              showToast(error.message || 'Failed to delete account', 'error');
            }
          },
        },
      ]
    );
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await profileService.save(user.id, {
        ...profile,
        preferences: profile?.preferences || {},
      });
      showToast('Settings saved successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSaveSettings} disabled={saving}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.personalInfoCard}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Background Check</Text>
            <Badge
              variant={
                profile?.backgroundCheckStatus === 'approved'
                  ? 'success'
                  : profile?.backgroundCheckStatus === 'rejected'
                  ? 'error'
                  : 'warning'
              }
            >
              {profile?.backgroundCheckStatus || 'pending'}
            </Badge>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{profile?.location?.city || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coordinates</Text>
            <Text style={styles.infoValue}>
              {profile?.location
                ? `${profile.location.latitude.toFixed(4)}, ${profile.location.longitude.toFixed(4)}`
                : 'Not set'}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Visit Stats & Badges</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Calendar size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.totalVisits}</Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={24} color={colors.success} />
              <Text style={styles.statValue}>{stats.completedVisits}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={24} color={colors.warning} />
              <Text style={styles.statValue}>{userRewards?.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={24} color={colors.primary} />
              <Text style={styles.statValue}>Lv {userRewards?.level || 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
          {userRewards?.badges && userRewards.badges.length > 0 && (
            <View style={styles.badgesContainer}>
              <Text style={styles.badgesTitle}>Earned Badges</Text>
              <View style={styles.badgesList}>
                {userRewards.badges.map((badge: any) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <Award size={32} color={colors.warning} />
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Booking Reminders</Text>
            <Switch
              value={notifications.bookingReminders}
              onValueChange={(value) =>
                setNotifications({ ...notifications, bookingReminders: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Pet Updates</Text>
            <Switch
              value={notifications.petUpdates}
              onValueChange={(value) => setNotifications({ ...notifications, petUpdates: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Message Alerts</Text>
            <Switch
              value={notifications.messageAlerts}
              onValueChange={(value) =>
                setNotifications({ ...notifications, messageAlerts: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Weekly Digest</Text>
            <Switch
              value={notifications.weeklyDigest}
              onValueChange={(value) => setNotifications({ ...notifications, weeklyDigest: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Car size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Transportation</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Car</Text>
            <Switch
              value={transportOptions.car}
              onValueChange={(value) => setTransportOptions({ ...transportOptions, car: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Public Transit</Text>
            <Switch
              value={transportOptions.publicTransit}
              onValueChange={(value) =>
                setTransportOptions({ ...transportOptions, publicTransit: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Walking</Text>
            <Switch
              value={transportOptions.walking}
              onValueChange={(value) => setTransportOptions({ ...transportOptions, walking: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bike</Text>
            <Switch
              value={transportOptions.bike}
              onValueChange={(value) => setTransportOptions({ ...transportOptions, bike: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <PawPrint size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Preferred Species & Breeds</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Species</Text>
            <Text style={styles.infoValue}>
              {profile?.preferences?.species?.join(', ') || 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Size Preference</Text>
            <Text style={styles.infoValue}>
              {profile?.preferences?.size?.join(', ') || 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Temperament</Text>
            <Text style={styles.infoValue}>
              {profile?.preferences?.temperament?.join(', ') || 'Not set'}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Accessibility size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Accessibility</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Large Text</Text>
            <Switch
              value={accessibility.largeText}
              onValueChange={(value) => setAccessibility({ ...accessibility, largeText: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>High Contrast</Text>
            <Switch
              value={accessibility.highContrast}
              onValueChange={(value) =>
                setAccessibility({ ...accessibility, highContrast: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Screen Reader Optimized</Text>
            <Switch
              value={accessibility.screenReader}
              onValueChange={(value) =>
                setAccessibility({ ...accessibility, screenReader: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>

        <View style={styles.actionsSection}>
          <Button
            title="Developer"
            variant="secondary"
            onPress={() => router.push('/developer')}
            icon={<Code size={20} color={colors.text} />}
          />
          <Button
            title="Retake Profile Setup"
            variant="secondary"
            onPress={handleRetakeProfileSetup}
            icon={<Settings size={20} color={colors.text} />}
          />
          <Button
            title="Export My Data (JSON)"
            variant="secondary"
            onPress={handleExportData}
            icon={<Download size={20} color={colors.text} />}
          />
          <Button
            title="Delete Account"
            variant="ghost"
            onPress={handleDeleteAccount}
            icon={<Trash2 size={20} color={colors.error} />}
            style={styles.deleteButton}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  personalInfoCard: {
    marginTop: spacing.lg,
  },
  card: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgesContainer: {
    marginTop: spacing.lg,
  },
  badgesTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    minWidth: 80,
  },
  badgeName: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.text,
  },
  actionsSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
