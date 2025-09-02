import { Query } from 'react-native-appwrite';
import { appwriteConfig, databases, ID } from './appwrite';

export interface Request {
  $id: string;
  title: string;
  description: string;
  requesterId: string;
  helperId?: string;
  roomId: string;
  skillsNeeded: string[];
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  // Virtual fields populated from other collections
  requester?: {
    $id: string;
    name: string;
    avatar?: string;
  };
  helper?: {
    $id: string;
    name: string;
    avatar?: string;
  };
}

export const requestsConfig = {
  requestsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REQUESTS_COLLECTION_ID || 'requests',
};

/**
 * Create a new help request
 */
export const createRequest = async (requestData: {
  title: string;
  description: string;
  requesterId: string;
  roomId: string;
  skillsNeeded: string[];
}): Promise<Request> => {
  try {
    const request = await databases.createDocument(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      ID.unique(),
      {
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    );

    return request as unknown as Request;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

/**
 * Accept a help request
 */
export const acceptRequest = async (requestId: string, helperId: string): Promise<Request> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      requestId,
      {
        helperId,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      }
    );

    return request as unknown as Request;
  } catch (error) {
    console.error('Error accepting request:', error);
    throw error;
  }
};

/**
 * Complete a help request
 */
export const completeRequest = async (requestId: string): Promise<Request> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      requestId,
      {
        status: 'completed',
        completedAt: new Date().toISOString(),
      }
    );

    return request as unknown as Request;
  } catch (error) {
    console.error('Error completing request:', error);
    throw error;
  }
};

/**
 * Cancel a help request
 */
export const cancelRequest = async (requestId: string): Promise<Request> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      requestId,
      {
        status: 'cancelled',
      }
    );

    return request as unknown as Request;
  } catch (error) {
    console.error('Error cancelling request:', error);
    throw error;
  }
};

/**
 * Get requests sent by a user
 */
export const getSentRequests = async (userId: string): Promise<Request[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      [
        Query.equal('requesterId', userId),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as Request[];
  } catch (error) {
    console.error('Error getting sent requests:', error);
    throw error;
  }
};

/**
 * Get requests received by a user (where they can help)
 */
export const getReceivedRequests = async (userId: string, roomId?: string): Promise<Request[]> => {
  try {
    const queries = [
      Query.notEqual('requesterId', userId),
      Query.equal('status', 'pending'),
      Query.orderDesc('createdAt'),
    ];

    if (roomId) {
      queries.push(Query.equal('roomId', roomId));
    }

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      queries
    );

    return response.documents as unknown as Request[];
  } catch (error) {
    console.error('Error getting received requests:', error);
    throw error;
  }
};

/**
 * Get requests for a specific room
 */
export const getRoomRequests = async (roomId: string): Promise<Request[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as Request[];
  } catch (error) {
    console.error('Error getting room requests:', error);
    throw error;
  }
};

/**
 * Get accepted requests where user is the helper
 */
export const getHelpingRequests = async (userId: string): Promise<Request[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      requestsConfig.requestsCollectionId,
      [
        Query.equal('helperId', userId),
        Query.notEqual('status', 'completed'),
        Query.notEqual('status', 'cancelled'),
        Query.orderDesc('acceptedAt'),
      ]
    );

    return response.documents as unknown as Request[];
  } catch (error) {
    console.error('Error getting helping requests:', error);
    throw error;
  }
};
