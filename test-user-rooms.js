const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

// Exact same configuration as the app
const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'resourcely',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'dbandroid',
};

const roomsConfig = {
  roomsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOMS_COLLECTION_ID || 'rooms',
  roomMembersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOM_MEMBERS_COLLECTION_ID || 'room_members',
};

console.log('App Config:', appwriteConfig);
console.log('Room Config:', roomsConfig);

// Initialize Appwrite client exactly like the app
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const databases = new Databases(client);

// Replicate the exact getUserRooms function
const getUserRooms = async (userId) => {
  try {
    console.log('getUserRooms called with userId:', userId);
    
    // First get all room memberships for the user
    const memberships = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId,
      [Query.equal('userId', userId)]
    );

    console.log('Found memberships:', memberships.documents.length);
    console.log('Memberships data:', memberships.documents);

    if (memberships.documents.length === 0) {
      console.log('No memberships found, returning empty array');
      return [];
    }

    // Get room IDs
    const roomIds = memberships.documents.map(membership => membership.roomId);
    console.log('Room IDs to fetch:', roomIds);

    // Get room details
    const rooms = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId,
      [Query.equal('$id', roomIds)]
    );

    console.log('Retrieved rooms:', rooms.documents.length);
    console.log('Rooms data:', rooms.documents);

    return rooms.documents;
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    throw error;
  }
};

async function testRoomFetching() {
  try {
    // Get a test user (assuming the first user is our test user)
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      'users'
    );
    
    if (users.documents.length === 0) {
      console.log('No users found!');
      return;
    }
    
    const testUser = users.documents[0];
    console.log('\n=== Testing with user ===');
    console.log('User ID:', testUser.$id);
    console.log('User name:', testUser.name);
    
    // Test getUserRooms function
    const userRooms = await getUserRooms(testUser.$id);
    console.log('\n=== Results ===');
    console.log('User rooms count:', userRooms.length);
    
    if (userRooms.length > 0) {
      console.log('User rooms:');
      userRooms.forEach(room => {
        console.log(`  - ${room.name} (${room.$id})`);
        console.log(`    Description: ${room.description}`);
        console.log(`    Member count: ${room.memberCount}`);
        console.log(`    Public: ${room.isPublic}`);
      });
    } else {
      console.log('No rooms found for user');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRoomFetching();
