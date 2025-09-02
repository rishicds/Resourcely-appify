const { Client, Databases, Account, Query } = require('node-appwrite');
require('dotenv').config();

// Configuration
const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
};

console.log('Config:', config);

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const databases = new Databases(client);

async function debugRooms() {
  try {
    console.log('Debugging room fetching...');
    
    // Try to list all rooms first
    console.log('\n1. Listing all rooms:');
    const allRooms = await databases.listDocuments(
      config.databaseId,
      'rooms'
    );
    console.log(`Found ${allRooms.documents.length} total rooms`);
    allRooms.documents.forEach(room => {
      console.log(`  - Room: ${room.name} (ID: ${room.$id})`);
    });
    
    // Try to list all room members
    console.log('\n2. Listing all room members:');
    const allMembers = await databases.listDocuments(
      config.databaseId,
      'room_members'
    );
    console.log(`Found ${allMembers.documents.length} total memberships`);
    allMembers.documents.forEach(member => {
      console.log(`  - User ${member.userId} in room ${member.roomId} (role: ${member.role})`);
    });
    
    // Try to simulate getUserRooms logic
    console.log('\n3. Simulating getUserRooms logic:');
    
    // First, let's see what users exist
    const allUsers = await databases.listDocuments(
      config.databaseId,
      'users'
    );
    console.log(`Found ${allUsers.documents.length} users`);
    
    if (allUsers.documents.length > 0) {
      const testUserId = allUsers.documents[0].$id;
      console.log(`Using test user ID: ${testUserId}`);
      
      // Get memberships for this user
      const userMemberships = await databases.listDocuments(
        config.databaseId,
        'room_members',
        [Query.equal('userId', testUserId)]
      );
      
      console.log(`User has ${userMemberships.documents.length} memberships`);
      
      if (userMemberships.documents.length > 0) {
        const roomIds = userMemberships.documents.map(membership => membership.roomId);
        console.log('Room IDs:', roomIds);
        
        // Get room details
        const userRooms = await databases.listDocuments(
          config.databaseId,
          'rooms',
          [Query.equal('$id', roomIds)]
        );
        
        console.log(`Retrieved ${userRooms.documents.length} room details`);
        userRooms.documents.forEach(room => {
          console.log(`  - ${room.name}: ${room.description}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    if (error.response) {
      console.error('Response data:', error.response);
    }
  }
}

debugRooms();
