import { Query } from 'react-native-appwrite';
import { appwriteConfig, databases } from './appwrite';

export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  tools: string[];
  isAvailable: boolean;
  hasCompletedOnboarding: boolean;
  lastActive?: string;
  helpScore?: number;
}

/**
 * Search users by skills, tools, or name
 */
export const searchUsers = async (
  query: string,
  filters?: {
    skills?: string[];
    tools?: string[];
    isAvailable?: boolean;
    roomId?: string;
  }
): Promise<User[]> => {
  try {
    const searchQueries = [];

    // Add text search queries
    if (query.trim()) {
      // Search in name (Appwrite supports search on indexed fields)
      searchQueries.push(Query.search('name', query));
    }

    // Add filter queries
    if (filters?.skills && filters.skills.length > 0) {
      // Search for users with any of the specified skills
      filters.skills.forEach(skill => {
        searchQueries.push(Query.search('skills', skill));
      });
    }

    if (filters?.tools && filters.tools.length > 0) {
      // Search for users with any of the specified tools
      filters.tools.forEach(tool => {
        searchQueries.push(Query.search('tools', tool));
      });
    }

    if (filters?.isAvailable !== undefined) {
      searchQueries.push(Query.equal('isAvailable', filters.isAvailable));
    }

    // If we have a room filter, we need to get room members first
    let roomMemberIds: string[] = [];
    if (filters?.roomId) {
      const roomMembersResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        'room_members', // Assuming this collection exists
        [Query.equal('roomId', filters.roomId)]
      );
      roomMemberIds = roomMembersResponse.documents.map(member => member.userId);
    }

    // Perform the search
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      searchQueries.length > 0 ? searchQueries : [Query.limit(25)]
    );

    let users = response.documents as unknown as User[];

    // Filter by room membership if specified
    if (filters?.roomId && roomMemberIds.length > 0) {
      users = users.filter(user => roomMemberIds.includes(user.$id));
    }

    // Additional client-side filtering for more complex queries
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
        user.tools.some(tool => tool.toLowerCase().includes(lowerQuery))
      );
    }

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get users by specific skills
 */
export const getUsersBySkills = async (skills: string[]): Promise<User[]> => {
  try {
    const queries = skills.map(skill => Query.search('skills', skill));
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    return response.documents as unknown as User[];
  } catch (error) {
    console.error('Error getting users by skills:', error);
    throw error;
  }
};

/**
 * Get users by specific tools
 */
export const getUsersByTools = async (tools: string[]): Promise<User[]> => {
  try {
    const queries = tools.map(tool => Query.search('tools', tool));
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    return response.documents as unknown as User[];
  } catch (error) {
    console.error('Error getting users by tools:', error);
    throw error;
  }
};

/**
 * Get available users in a room
 */
export const getAvailableRoomUsers = async (roomId: string): Promise<User[]> => {
  try {
    // Get room members
    const roomMembersResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      'room_members',
      [Query.equal('roomId', roomId)]
    );

    const memberIds = roomMembersResponse.documents.map(member => member.userId);

    if (memberIds.length === 0) {
      return [];
    }

    // Get available users from those members
    // Note: Appwrite has a limit on the number of values in Query.equal
    // So we might need to chunk this for large rooms
    const chunkSize = 20;
    const chunks = [];
    for (let i = 0; i < memberIds.length; i += chunkSize) {
      chunks.push(memberIds.slice(i, i + chunkSize));
    }

    const allUsers: User[] = [];
    for (const chunk of chunks) {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [
          Query.equal('$id', chunk),
          Query.equal('isAvailable', true)
        ]
      );
      allUsers.push(...(response.documents as unknown as User[]));
    }

    return allUsers;
  } catch (error) {
    console.error('Error getting available room users:', error);
    throw error;
  }
};

/**
 * Update user availability status
 */
export const updateUserAvailability = async (userId: string, isAvailable: boolean): Promise<User> => {
  try {
    const user = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        isAvailable,
        lastActive: new Date().toISOString(),
      }
    );

    return user as unknown as User;
  } catch (error) {
    console.error('Error updating user availability:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    return user as unknown as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
