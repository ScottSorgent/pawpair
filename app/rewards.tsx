import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Toast } from '@/components/Toast';
import { Award, TrendingUp, Users, Gift, Heart, Sparkles } from 'lucide-react-native';
import { rewards as rewardsService } from '@/services/rewards';
import { useStore } from '@/store/useStore';
import { Reward } from '@/types';

const EARNING_METHODS = [
  {
    id: 'booking',
    title: 'Complete a Visit',
    points: 50,
    icon: Award,
    description: 'Schedule and attend a pet visit',
  },
  {
    id: 'feedback',
    title: 'Submit Feedback',
    points: 25,
    icon: TrendingUp,
    description: 'Share your visit experience',
  },
  {
    id: 'referral',
    title: 'Refer a Friend',
    points: 200,
    icon: Users,
    description: 'Invite someone to join PawPair',
  },
];

const REDEMPTION_OPTIONS = [
  {
    id: 'donation-10',
    title: '$10 Shelter Donation',
    points: 100,
    description: 'Support your local shelter',
    icon: Heart,
  },
  {
    id: 'adoption-25',
    title: '$25 Off Adoption',
    points: 250,
    description: 'Discount on adoption fees',
    icon: Gift,
  },
];

export default function Rewards() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const featureFlags = useStore((state) => state.featureFlags);

  const [rewardData, setRewardData] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (featureFlags.rewardsEnabled) {
      loadRewards();
    } else {
      setLoading(false);
    }
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const data = await rewardsService.get(user?.id || '1');
      setRewardData(data);
    } catch (error) {
      console.error('Failed to load rewards:', error);
      showToast('Failed to load rewards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (optionId: string) => {
    showToast('Redemption coming soon in next update', 'info');
  };

  if (!featureFlags.rewardsEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rewards</Text>
        </View>
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonIcon}>
            <Sparkles size={64} color={colors.primary} />
          </View>
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            We're working on an exciting rewards program where you can earn points for visits, feedback, and referrals.
          </Text>
          <Text style={styles.comingSoonText}>
            Stay tuned for updates!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rewards</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceIconContainer}>
            <Award size={32} color={colors.warning} />
          </View>
          <Text style={styles.balanceLabel}>Your Points</Text>
          <Text style={styles.balanceValue}>{rewardData?.points || 0}</Text>
          <Text style={styles.balanceSubtext}>Level {rewardData?.level || 1}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Earn Points</Text>
          <View style={styles.earningMethods}>
            {EARNING_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <View key={method.id} style={styles.methodCard}>
                  <View style={styles.methodIconContainer}>
                    <Icon size={24} color={colors.primary} />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>
                  <View style={styles.methodPoints}>
                    <Text style={styles.methodPointsValue}>+{method.points}</Text>
                    <Text style={styles.methodPointsLabel}>pts</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redeem Points</Text>
          <Text style={styles.sectionSubtitle}>
            Use your points to support shelters or save on adoption
          </Text>
          <View style={styles.redemptionOptions}>
            {REDEMPTION_OPTIONS.map((option) => {
              const Icon = option.icon;
              const canAfford = (rewardData?.points || 0) >= option.points;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.redemptionCard, !canAfford && styles.redemptionCardDisabled]}
                  onPress={() => handleRedeem(option.id)}
                  activeOpacity={0.7}
                  disabled={!canAfford}
                >
                  <View style={styles.redemptionHeader}>
                    <View style={[
                      styles.redemptionIconContainer,
                      !canAfford && styles.redemptionIconContainerDisabled
                    ]}>
                      <Icon size={24} color={canAfford ? colors.primary : colors.textSecondary} />
                    </View>
                    <View style={styles.redemptionBadge}>
                      <Text style={[
                        styles.redemptionBadgeText,
                        !canAfford && styles.redemptionBadgeTextDisabled
                      ]}>
                        {option.points} pts
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.redemptionTitle, !canAfford && styles.redemptionTitleDisabled]}>
                    {option.title}
                  </Text>
                  <Text style={styles.redemptionDescription}>{option.description}</Text>
                  {!canAfford && (
                    <Text style={styles.redemptionNote}>
                      Need {option.points - (rewardData?.points || 0)} more points
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {rewardData && rewardData.history && rewardData.history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.historyList}>
              {rewardData.history.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyAction}>{item.action}</Text>
                    <Text style={styles.historyDate}>
                      {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={styles.historyPoints}>+{item.points}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {rewardData && rewardData.badges && rewardData.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <View style={styles.badgesGrid}>
              {rewardData.badges.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <View style={styles.badgeIconContainer}>
                    <Award size={32} color={colors.warning} />
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.spacer} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  comingSoonIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonTitle: {
    ...typography.h1,
    color: colors.text,
  },
  comingSoonText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  balanceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  balanceValue: {
    ...typography.h1,
    fontSize: 48,
    color: colors.surface,
    fontWeight: '700',
  },
  balanceSubtext: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  earningMethods: {
    gap: spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  methodDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  methodPoints: {
    alignItems: 'flex-end',
  },
  methodPointsValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  methodPointsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  redemptionOptions: {
    gap: spacing.md,
  },
  redemptionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  redemptionCardDisabled: {
    opacity: 0.6,
  },
  redemptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  redemptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redemptionIconContainerDisabled: {
    backgroundColor: colors.background,
  },
  redemptionBadge: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  redemptionBadgeText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  redemptionBadgeTextDisabled: {
    color: colors.textSecondary,
  },
  redemptionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  redemptionTitleDisabled: {
    color: colors.textSecondary,
  },
  redemptionDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  redemptionNote: {
    ...typography.bodySmall,
    color: colors.warning,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  historyList: {
    gap: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyPoints: {
    ...typography.body,
    fontWeight: '700',
    color: colors.success,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  badgeDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  spacer: {
    height: spacing.xl,
  },
});
