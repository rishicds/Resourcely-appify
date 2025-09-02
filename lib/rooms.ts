import { Query } from 'react-native-appwrite';
import { appwriteConfig, databases, ID } from './appwrite';

export interface Room {
  $id: string;
  name: string;
  description: string;
  tools: string[];
  skills: string[];
  createdBy: string;
  memberCount: number;
  isPublic: boolean;
  joinCode: string;
}

export interface RoomMember {
  $id: string;
  roomId: string;
  userId: string;
  joinedAt: string;
  role: 'admin' | 'member';
}

// Room collection configuration
export const roomsConfig = {
  roomsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOMS_COLLECTION_ID || 'rooms',
  roomMembersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOM_MEMBERS_COLLECTION_ID || 'room_members',
};

/**
 * Generate a random room join code
 */
const generateJoinCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Create a new room
 */
export const createRoom = async (roomData: {
  name: string;
  description: string;
  tools: string[];
  skills: string[];
  isPublic: boolean;
  createdBy: string;
}): Promise<Room> => {
  try {
    const joinCode = generateJoinCode();
    
    const room = await databases.createDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      ID.unique(),
      {
        ...roomData,
        joinCode,
        memberCount: 1,
      }
    );

    // Add creator as admin member
    await databases.createDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      ID.unique(),
      {
        roomId: room.$id,
        userId: roomData.createdBy,
        joinedAt: new Date().toISOString(),
        role: 'admin',
      }
    );

    return room as unknown as Room;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Get rooms where user is a member
 */
export const getUserRooms = async (userId: string): Promise<Room[]> => {
  try {
    console.log('getUserRooms called with userId:', userId);
    
    if (!userId) {
      console.error('getUserRooms: No userId provided');
      throw new Error('User ID is required');
    }
    
    // First get all room memberships for the user
    console.log('Querying room memberships...');
    const memberships = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      [Query.equal('userId', userId)]
    );

    console.log('Found memberships:', memberships.documents.length);
    console.log('Memberships data:', JSON.stringify(memberships.documents, null, 2));

    if (memberships.documents.length === 0) {
      console.log('No memberships found, returning empty array');
      return [];
    }

    // Get room IDs
    const roomIds = memberships.documents.map(membership => membership.roomId);
    console.log('Room IDs to fetch:', roomIds);

    // Get room details
    console.log('Querying room details...');
    const rooms = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      [Query.equal('$id', roomIds)]
    );

    console.log('Retrieved rooms:', rooms.documents.length);
    console.log('Rooms data:', JSON.stringify(rooms.documents, null, 2));

    const result = rooms.documents as unknown as Room[];
    console.log('Returning rooms:', result.length);
    return result;
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // If it's an Appwrite error, log the response
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('Appwrite error response:', JSON.stringify(error.response, null, 2));
    }
    
    throw error;
  }
};

/**
 * Get public rooms (for discovery)
 */
export const getPublicRooms = async (userId: string): Promise<Room[]> => {
  try {
    // Get all public rooms
    const rooms = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      [
        Query.equal('isPublic', true),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    // Filter out rooms where user is already a member
    const userMemberships = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      [Query.equal('userId', userId)]
    );

    const userRoomIds = userMemberships.documents.map(membership => membership.roomId);
    
    return rooms.documents.filter(room => !userRoomIds.includes(room.$id)) as unknown as Room[];
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    throw error;
  }
};

/**
 * Join a room by room ID
 */
export const joinRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    // Check if user is already a member
    const existingMembership = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.equal('userId', userId)
      ]
    );

    if (existingMembership.documents.length > 0) {
      throw new Error('User is already a member of this room');
    }

    // Add user as member
    await databases.createDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      ID.unique(),
      {
        roomId,
        userId,
        joinedAt: new Date().toISOString(),
        role: 'member',
      }
    );

    // Update room member count
    const room = await databases.getDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      roomId
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      roomId,
      {
        memberCount: (room.memberCount || 0) + 1,
      }
    );
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

/**
 * Join a room by join code
 */
export const joinRoomByCode = async (joinCode: string, userId: string): Promise<Room> => {
  try {
    // Find room by join code
    const rooms = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      [Query.equal('joinCode', joinCode.toUpperCase())]
    );

    if (rooms.documents.length === 0) {
      throw new Error('Invalid room code');
    }

    const room = rooms.documents[0];
    
    // Join the room
    await joinRoom(room.$id, userId);
    
    return room as unknown as Room;
  } catch (error) {
    console.error('Error joining room by code:', error);
    throw error;
  }
};

/**
 * Check if user is member of a room
 */
export const isUserMemberOfRoom = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    const memberships = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.equal('userId', userId)
      ]
    );

    return memberships.documents.length > 0;
  } catch (error) {
    console.error('Error checking room membership:', error);
    return false;
  }
};

/**
 * Get room details by ID
 */
export const getRoomById = async (roomId: string): Promise<Room | null> => {
  try {
    const room = await databases.getDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      roomId
    );

    return room as unknown as Room;
  } catch (error) {
    console.error('Error fetching room:', error);
    return null;
  }
};

/**
 * Leave a room
 */
export const leaveRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    // Find membership
    const memberships = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.equal('userId', userId)
      ]
    );

    if (memberships.documents.length === 0) {
      throw new Error('User is not a member of this room');
    }

    // Remove membership
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      memberships.documents[0].$id
    );

    // Update room member count
    const room = await databases.getDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      roomId
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      roomId,
      {
        memberCount: Math.max(0, (room.memberCount || 0) - 1),
      }
    );
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};
