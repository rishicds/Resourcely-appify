// Simple test script for React Native Appwrite setup
const { Client, Databases, Account, Query } = require('react-native-appwrite');
require('dotenv').config();

const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || 'com.rishi.resourcely',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'resourcely',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'dbandroid',
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || 'users',
};

const roomsConfig = {
  roomsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOMS_COLLECTION_ID || 'rooms',
  roomMembersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOM_MEMBERS_COLLECTION_ID || 'room_members',
};

console.log('Testing React Native Appwrite client...');
console.log('Config:', appwriteConfig);

// Initialize Appwrite client exactly like React Native app
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const databases = new Databases(client);

async function testReactNativeAppwrite() {
  try {
    console.log('\n1. Testing basic connection...');
    
    // Test if we can list documents (this doesn't require auth)
    const rooms = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomsCollectionId
    );
    
    console.log('✓ Successfully connected to Appwrite');
    console.log(`✓ Found ${rooms.documents.length} rooms`);
    
    console.log('\n2. Testing room members query...');
    const members = await databases.listDocuments(
      appwriteConfig.databaseId,
      roomsConfig.roomMembersCollectionId
    );
    
    console.log(`✓ Found ${members.documents.length} room members`);
    
    if (members.documents.length > 0) {
      const testUserId = members.documents[0].userId;
      console.log(`\n3. Testing getUserRooms logic with user: ${testUserId}`);
      
      // Test the exact query used in getUserRooms
      const userMemberships = await databases.listDocuments(
        appwriteConfig.databaseId,
        roomsConfig.roomMembersCollectionId,
        [Query.equal('userId', testUserId)]
      );
      
      console.log(`✓ Found ${userMemberships.documents.length} memberships for user`);
      
      if (userMemberships.documents.length > 0) {
        const roomIds = userMemberships.documents.map(membership => membership.roomId);
        console.log('Room IDs:', roomIds);
        
        const userRooms = await databases.listDocuments(
          appwriteConfig.databaseId,
          roomsConfig.roomsCollectionId,
          [Query.equal('$id', roomIds)]
        );
        
        console.log(`✓ Successfully fetched ${userRooms.documents.length} room details`);
        
        userRooms.documents.forEach(room => {
          console.log(`  - ${room.name} (${room.$id})`);
        });
      }
    }
    
    console.log('\n✅ All tests passed! React Native Appwrite client is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

testReactNativeAppwrite();
