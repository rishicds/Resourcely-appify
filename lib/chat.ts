import { Query } from 'react-native-appwrite';
import { appwriteConfig, databases, ID } from './appwrite';

export interface ChatMessage {
  $id: string;
  content: string;
  senderId: string;
  roomId: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  // Virtual fields populated from other collections
  sender?: {
    $id: string;
    name: string;
    avatar?: string;
  };
}

export const chatConfig = {
  messagesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID || 'messages',
};

/**
 * Send a message to a room
 */
export const sendMessage = async (messageData: {
  content: string;
  senderId: string;
  roomId: string;
  type?: 'text' | 'image' | 'file';
}): Promise<ChatMessage> => {
  try {
    const message = await databases.createDocument(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      ID.unique(),
      {
        ...messageData,
        type: messageData.type || 'text',
        createdAt: new Date().toISOString(),
      }
    );

    return message as unknown as ChatMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages for a room
 */
export const getRoomMessages = async (roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    // Reverse to show newest at bottom
    return (response.documents as unknown as ChatMessage[]).reverse();
  } catch (error) {
    console.error('Error getting room messages:', error);
    throw error;
  }
};

/**
 * Get recent messages for a room (for realtime updates)
 */
export const getRecentMessages = async (roomId: string, since: string): Promise<ChatMessage[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.greaterThan('createdAt', since),
        Query.orderAsc('createdAt'),
      ]
    );

    return response.documents as unknown as ChatMessage[];
  } catch (error) {
    console.error('Error getting recent messages:', error);
    throw error;
  }
};

/**
 * Delete a message (only by sender)
 */
export const deleteMessage = async (messageId: string, senderId: string): Promise<void> => {
  try {
    // First verify the sender owns this message
    const message = await databases.getDocument(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      messageId
    );

    if (message.senderId !== senderId) {
      throw new Error('Unauthorized: You can only delete your own messages');
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      messageId
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Get message count for a room
 */
export const getRoomMessageCount = async (roomId: string): Promise<number> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.limit(1), // We only need count
      ]
    );

    return response.total;
  } catch (error) {
    console.error('Error getting message count:', error);
    return 0;
  }
};

/**
 * Search messages in a room
 */
export const searchRoomMessages = async (roomId: string, searchQuery: string, limit: number = 20): Promise<ChatMessage[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      chatConfig.messagesCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.search('content', searchQuery),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
      ]
    );

    return response.documents as unknown as ChatMessage[];
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};
