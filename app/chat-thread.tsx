import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { ArrowLeft, Send, MapPin, Calendar } from 'lucide-react-native';
import { messages } from '@/services/messages';
import { useStore } from '@/store/useStore';
import { Message, Thread } from '@/types';

const QUICK_TEMPLATES = [
  { id: 'arrived', text: 'I have arrived' },
  { id: 'late', text: 'Running late 10 minutes' },
  { id: 'thanks', text: 'Thank you!' },
];

export default function ChatThread() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const threadId = params.threadId as string;
  const user = useStore((state) => state.user);

  const [thread, setThread] = useState<Thread | null>(null);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadThread();
    loadMessages();
  }, [threadId]);

  const loadThread = async () => {
    try {
      const threadData = await messages.getThread(threadId);
      setThread(threadData);
      await messages.markAsRead(threadId);
    } catch (error) {
      console.error('Failed to load thread:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await messages.getMessages(threadId);
      setMessageList(data);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const content = text || messageText.trim();
    if (!content || sending) return;

    setSending(true);
    setMessageText('');

    try {
      const newMessage = await messages.sendMessage(threadId, user?.id || '1', content);
      setMessageList((prev) => [...prev, newMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(content);
    } finally {
      setSending(false);
    }
  };

  const handleQuickTemplate = (template: string) => {
    handleSendMessage(template);
  };

  const handleViewBooking = () => {
    console.log('Navigate to booking:', thread?.bookingId);
  };

  const handleDirections = () => {
    if (thread?.shelterId) {
      console.log('Open directions to shelter:', thread.shelterId);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.senderType === 'user';
    const showDateHeader = index === 0 ||
      formatDate(item.timestamp) !== formatDate(messageList[index - 1].timestamp);

    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.shelterMessageContainer]}>
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.shelterBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.shelterMessageText]}>
              {item.content}
            </Text>
            <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.shelterMessageTime]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{thread?.shelterName}</Text>
          {thread?.petName && (
            <Text style={styles.headerSubtitle}>About {thread.petName}</Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messageList}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {thread?.bookingId && (
          <View style={styles.actionsBar}>
            <TouchableOpacity style={styles.actionChip} onPress={handleViewBooking}>
              <Calendar size={16} color={colors.primary} />
              <Text style={styles.actionChipText}>View Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionChip} onPress={handleDirections}>
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.actionChipText}>Directions</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.quickTemplates}>
          {QUICK_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateButton}
              onPress={() => handleQuickTemplate(template.text)}
              disabled={sending}
            >
              <Text style={styles.templateText}>{template.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Send size={20} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateHeaderText: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  shelterMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  shelterBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  userMessageText: {
    color: colors.surface,
  },
  shelterMessageText: {
    color: colors.text,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 11,
  },
  userMessageTime: {
    color: colors.surface + 'CC',
  },
  shelterMessageTime: {
    color: colors.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  actionChipText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  quickTemplates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  templateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    ...typography.body,
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
