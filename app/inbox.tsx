import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { MessageCircle, ChevronRight } from 'lucide-react-native';
import { messages } from '@/services/messages';
import { useStore } from '@/store/useStore';
import { Thread } from '@/types';

export default function Inbox() {
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await messages.listThreads(user?.id || '1');
      setThreads(data);
      setIsOffline(false);
    } catch (error: any) {
      console.error('Failed to load threads:', error);
      const errorMessage = error.message || 'Failed to load messages';
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('offline')) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleThreadPress = (threadId: string) => {
    router.push(`/chat-thread?threadId=${threadId}`);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderThread = ({ item }: { item: Thread }) => (
    <TouchableOpacity
      style={styles.threadItem}
      onPress={() => handleThreadPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.threadIcon}>
        <MessageCircle size={24} color={colors.primary} />
      </View>

      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={styles.shelterName} numberOfLines={1}>
            {item.shelterName}
          </Text>
          <Text style={styles.timestamp}>{formatTime(item.lastMessageTime)}</Text>
        </View>

        {item.petName && (
          <Text style={styles.petName}>About {item.petName}</Text>
        )}

        <Text
          style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>

      <View style={styles.threadRight}>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner visible={isOffline} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon={MessageCircle}
          title="Unable to Load Messages"
          message={error}
          actionLabel="Retry"
          onAction={loadThreads}
        />
      ) : threads.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No Messages Yet"
          message="When you connect with shelters, your conversations will appear here."
        />
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    padding: spacing.sm,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  threadIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadContent: {
    flex: 1,
    gap: spacing.xs,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shelterName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  petName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  lastMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
    color: colors.text,
  },
  threadRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 11,
  },
});
