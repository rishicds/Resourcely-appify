import { Query } from 'react-native-appwrite';
import { appwriteConfig, databases, ID } from './appwrite';

export interface Broadcast {
  $id: string;
  title: string;
  description: string;
  type: 'help' | 'collaboration' | 'announcement';
  authorId: string;
  roomId: string;
  isActive: boolean;
  responses: number;
  createdAt: string;
  expiresAt?: string;
  // Virtual fields populated from other collections
  author?: {
    $id: string;
    name: string;
    avatar?: string;
  };
}

export const broadcastsConfig = {
  broadcastsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BROADCASTS_COLLECTION_ID || 'broadcasts',
};

/**
 * Create a new broadcast
 */
export const createBroadcast = async (broadcastData: {
  title: string;
  description: string;
  type: 'help' | 'collaboration' | 'announcement';
  authorId: string;
  roomId: string;
  expiresAt?: string;
}): Promise<Broadcast> => {
  try {
    const broadcast = await databases.createDocument(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      ID.unique(),
      {
        ...broadcastData,
        isActive: true,
        responses: 0,
        createdAt: new Date().toISOString(),
      }
    );

    return broadcast as unknown as Broadcast;
  } catch (error) {
    console.error('Error creating broadcast:', error);
    throw error;
  }
};

/**
 * Get active broadcasts for a room
 */
export const getRoomBroadcasts = async (roomId: string): Promise<Broadcast[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.equal('isActive', true),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as Broadcast[];
  } catch (error) {
    console.error('Error getting room broadcasts:', error);
    throw error;
  }
};

/**
 * Get all active broadcasts across all rooms
 */
export const getAllActiveBroadcasts = async (): Promise<Broadcast[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      [
        Query.equal('isActive', true),
        Query.orderDesc('createdAt'),
        Query.limit(50), // Limit to recent broadcasts
      ]
    );

    return response.documents as unknown as Broadcast[];
  } catch (error) {
    console.error('Error getting all active broadcasts:', error);
    throw error;
  }
};

/**
 * Increment response count for a broadcast
 */
export const incrementBroadcastResponses = async (broadcastId: string): Promise<Broadcast> => {
  try {
    // First get current broadcast to get current response count
    const currentBroadcast = await databases.getDocument(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      broadcastId
    );

    const broadcast = await databases.updateDocument(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      broadcastId,
      {
        responses: (currentBroadcast.responses || 0) + 1,
      }
    );

    return broadcast as unknown as Broadcast;
  } catch (error) {
    console.error('Error incrementing broadcast responses:', error);
    throw error;
  }
};

/**
 * Deactivate a broadcast
 */
export const deactivateBroadcast = async (broadcastId: string): Promise<Broadcast> => {
  try {
    const broadcast = await databases.updateDocument(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      broadcastId,
      {
        isActive: false,
      }
    );

    return broadcast as unknown as Broadcast;
  } catch (error) {
    console.error('Error deactivating broadcast:', error);
    throw error;
  }
};

/**
 * Get broadcasts created by a user
 */
export const getUserBroadcasts = async (userId: string): Promise<Broadcast[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      [
        Query.equal('authorId', userId),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as Broadcast[];
  } catch (error) {
    console.error('Error getting user broadcasts:', error);
    throw error;
  }
};

/**
 * Auto-expire old broadcasts (call this periodically)
 */
export const expireOldBroadcasts = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Get broadcasts that should be expired
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      broadcastsConfig.broadcastsCollectionId,
      [
        Query.equal('isActive', true),
        Query.lessThan('expiresAt', now),
      ]
    );

    // Deactivate expired broadcasts
    const promises = response.documents.map(broadcast =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        broadcastsConfig.broadcastsCollectionId,
        broadcast.$id,
        { isActive: false }
      )
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error expiring old broadcasts:', error);
    throw error;
  }
};
