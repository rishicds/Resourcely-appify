import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, getRoomMessages, sendMessage } from '@/lib/chat';
import { getUserNameById, getUsersByIds } from '@/lib/user-utils';
import { ClayTheme } from '@/theme/claymorph';
import { Send } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface GroupChatProps {
  roomId: string;
}

export function GroupChat({ roomId }: GroupChatProps) {
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const roomMessages = await getRoomMessages(roomId);
      // Get unique senderIds
      const senderIds = Array.from(new Set(roomMessages.map(m => m.senderId)));
      const userMap = await getUsersByIds(senderIds);
      // Attach sender info
      const messagesWithSender = roomMessages.map(m => ({
        ...m,
        sender: userMap[m.senderId] || undefined,
      }));
      setMessages(messagesWithSender);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const message = await sendMessage({
        content: messageText,
        senderId: user.$id,
        roomId,
        type: 'text',
      });

      // Add sender info for immediate display
      // Attach sender info for immediate display
      const messageWithSender = {
        ...message,
        sender: {
          $id: user.$id,
          name: user.name,
          avatar: user.avatar,
        },
      };
      setMessages(prev => [...prev, messageWithSender]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    // Show time for today, date for older
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const [senderNames, setSenderNames] = useState<Record<string, string>>({});

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.$id;
    const senderName = item.sender?.name || senderNames[item.senderId] || `User ${item.senderId.substring(0, 8)}`;

    // If name is missing, fetch it and cache
    if (!item.sender?.name && !senderNames[item.senderId]) {
      getUserNameById(item.senderId).then(name => {
        if (name) setSenderNames(prev => ({ ...prev, [item.senderId]: name }));
      });
    }

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Text style={[styles.senderName, { color: ClayTheme.colors.primary }]}> 
            {senderName}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, { color: ClayTheme.colors.text.light }]}> 
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Group Chat</Text>
        <Text style={styles.chatSubtitle}>
          {messages.length} messages
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.$id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Loading messages...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          )
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={ClayTheme.colors.text.light}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          <Icon 
            name={Send} 
            size={20} 
            color={newMessage.trim() ? ClayTheme.colors.surface : ClayTheme.colors.text.light} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ClayTheme.colors.background,
  },
  chatHeader: {
    paddingHorizontal: ClayTheme.spacing.lg,
    paddingVertical: ClayTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ClayTheme.colors.clay.medium,
    backgroundColor: ClayTheme.colors.surface,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ClayTheme.colors.text.primary,
  },
  chatSubtitle: {
    fontSize: 14,
    marginTop: 2,
    color: ClayTheme.colors.text.secondary,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: ClayTheme.spacing.lg,
    paddingVertical: ClayTheme.spacing.md,
  },
  messageContainer: {
    marginBottom: ClayTheme.spacing.md,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: ClayTheme.spacing.xs,
    marginLeft: ClayTheme.spacing.sm,
    color: ClayTheme.colors.primary,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.sm,
    borderRadius: ClayTheme.borderRadius.large,
    borderWidth: 1,
  },
  myMessageBubble: {
    backgroundColor: ClayTheme.colors.primary,
    borderColor: ClayTheme.colors.primary,
  },
  otherMessageBubble: {
    backgroundColor: ClayTheme.colors.surface,
    borderColor: ClayTheme.colors.clay.medium,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: ClayTheme.colors.surface,
  },
  otherMessageText: {
    color: ClayTheme.colors.text.primary,
  },
  messageTime: {
    fontSize: 12,
    marginTop: ClayTheme.spacing.xs,
    marginHorizontal: ClayTheme.spacing.sm,
    color: ClayTheme.colors.text.light,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: ClayTheme.colors.text.light,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: ClayTheme.spacing.lg,
    paddingVertical: ClayTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: ClayTheme.colors.clay.medium,
    backgroundColor: ClayTheme.colors.surface,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: ClayTheme.borderRadius.large,
    paddingHorizontal: ClayTheme.spacing.md,
    paddingVertical: ClayTheme.spacing.sm,
    marginRight: ClayTheme.spacing.sm,
    maxHeight: 100,
    fontSize: 16,
    color: ClayTheme.colors.text.primary,
    backgroundColor: ClayTheme.colors.background,
    borderColor: ClayTheme.colors.clay.light,
    ...ClayTheme.shadows.claySubtle,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: ClayTheme.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    ...ClayTheme.shadows.claySubtle,
  },
  sendButtonActive: {
    backgroundColor: ClayTheme.colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: ClayTheme.colors.clay.light,
  },
});
