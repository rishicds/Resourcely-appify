import { Query } from 'react-native-appwrite';
import { appwriteConfig, databases, ID } from './appwrite';

export interface BorrowRequest {
  $id: string;
  title: string;
  description: string;
  category: string; // 'book', 'tool', 'equipment', 'other'
  borrowerId: string;
  lenderId?: string;
  roomId: string;
  status: 'pending' | 'approved' | 'borrowed' | 'returned' | 'rejected';
  borrowedAt?: string;
  returnedAt?: string;
  expectedReturnDate?: string;
  createdAt: string;
  approvedAt?: string;
  // Virtual fields populated from other collections
  borrower?: {
    $id: string;
    name: string;
    avatar?: string;
  };
  lender?: {
    $id: string;
    name: string;
    avatar?: string;
  };
}

export const borrowsConfig = {
  borrowsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BORROWS_COLLECTION_ID || 'borrows',
};

/**
 * Create a new borrow request
 */
export const createBorrowRequest = async (borrowData: {
  title: string;
  description: string;
  category: string;
  borrowerId: string;
  roomId: string;
  expectedReturnDate?: string;
}): Promise<BorrowRequest> => {
  try {
    const request = await databases.createDocument(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      ID.unique(),
      {
        ...borrowData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    );

    return request as unknown as BorrowRequest;
  } catch (error) {
    console.error('Error creating borrow request:', error);
    throw error;
  }
};

/**
 * Approve a borrow request
 */
export const approveBorrowRequest = async (requestId: string, lenderId: string): Promise<BorrowRequest> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      requestId,
      {
        lenderId,
        status: 'approved',
        approvedAt: new Date().toISOString(),
      }
    );

    return request as unknown as BorrowRequest;
  } catch (error) {
    console.error('Error approving borrow request:', error);
    throw error;
  }
};

/**
 * Mark item as borrowed
 */
export const markAsBorrowed = async (requestId: string): Promise<BorrowRequest> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      requestId,
      {
        status: 'borrowed',
        borrowedAt: new Date().toISOString(),
      }
    );

    return request as unknown as BorrowRequest;
  } catch (error) {
    console.error('Error marking as borrowed:', error);
    throw error;
  }
};

/**
 * Mark item as returned
 */
export const markAsReturned = async (requestId: string): Promise<BorrowRequest> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      requestId,
      {
        status: 'returned',
        returnedAt: new Date().toISOString(),
      }
    );

    return request as unknown as BorrowRequest;
  } catch (error) {
    console.error('Error marking as returned:', error);
    throw error;
  }
};

/**
 * Reject a borrow request
 */
export const rejectBorrowRequest = async (requestId: string): Promise<BorrowRequest> => {
  try {
    const request = await databases.updateDocument(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      requestId,
      {
        status: 'rejected',
      }
    );

    return request as unknown as BorrowRequest;
  } catch (error) {
    console.error('Error rejecting borrow request:', error);
    throw error;
  }
};

/**
 * Get borrow requests sent by a user
 */
export const getUserBorrowRequests = async (userId: string): Promise<BorrowRequest[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      [
        Query.equal('borrowerId', userId),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting user borrow requests:', error);
    throw error;
  }
};

/**
 * Get items being lent by a user
 */
export const getUserLendingItems = async (userId: string): Promise<BorrowRequest[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      [
        Query.equal('lenderId', userId),
        Query.orderDesc('approvedAt'),
      ]
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting user lending items:', error);
    throw error;
  }
};

/**
 * Get borrow requests for a specific room
 */
export const getRoomBorrowRequests = async (roomId: string): Promise<BorrowRequest[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting room borrow requests:', error);
    throw error;
  }
};

/**
 * Get pending borrow requests in a room (excluding user's own requests)
 */
export const getAvailableBorrowRequests = async (userId: string, roomId: string): Promise<BorrowRequest[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.equal('status', 'pending'),
        Query.notEqual('borrowerId', userId),
        Query.orderDesc('createdAt'),
      ]
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting available borrow requests:', error);
    throw error;
  }
};

/**
 * Get borrow tracking history for a room
 */
export const getRoomBorrowHistory = async (roomId: string): Promise<BorrowRequest[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.equal('status', ['borrowed', 'returned']),
        Query.orderDesc('borrowedAt'),
      ]
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting room borrow history:', error);
    throw error;
  }
};

/**
 * Get currently borrowed items by user
 */
export const getCurrentlyBorrowedItems = async (userId: string): Promise<BorrowRequest[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      [
        Query.equal('borrowerId', userId),
        Query.equal('status', 'borrowed'),
        Query.orderDesc('borrowedAt'),
      ]
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting currently borrowed items:', error);
    throw error;
  }
};

/**
 * Get overdue items (borrowed items past expected return date)
 */
export const getOverdueItems = async (roomId?: string): Promise<BorrowRequest[]> => {
  try {
    const now = new Date().toISOString();
    const queries = [
      Query.equal('status', 'borrowed'),
      Query.lessThan('expectedReturnDate', now),
      Query.orderDesc('expectedReturnDate'),
    ];

    if (roomId) {
      queries.push(Query.equal('roomId', roomId));
    }

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      borrowsConfig.borrowsCollectionId,
      queries
    );

    return response.documents as unknown as BorrowRequest[];
  } catch (error) {
    console.error('Error getting overdue items:', error);
    throw error;
  }
};
