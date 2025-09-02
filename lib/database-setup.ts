import { appwriteConfig, databases, ID } from './appwrite';

/**
 * Test script to verify database connection and schema
 * Make sure you've created the collection with proper attributes first
 */

// Helper function to test the setup
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('Database ID:', appwriteConfig.databaseId);
    console.log('Collection ID:', appwriteConfig.userCollectionId);
    
    const testDoc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        name: 'Test User',
        email: 'test@example.com',
        hasCompletedOnboarding: false,
        isAvailable: false,
        skills: [],
        tools: [],
      }
    );
    
    console.log('✅ Test document created successfully:', testDoc.$id);
    
    // Delete test document
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      testDoc.$id
    );
    
    console.log('✅ Test document deleted successfully');
    console.log('✅ Database connection test passed!');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

// Function to validate required attributes exist
export const validateDatabaseSchema = async () => {
  try {
    // Try to create a document with all required fields
    const testData = {
      name: 'Schema Test',
      email: 'schema@test.com',
      avatar: 'https://example.com/avatar.jpg',
      skills: ['JavaScript', 'React'],
      tools: ['VS Code', 'Figma'],
      isAvailable: true,
      hasCompletedOnboarding: false,
    };

    const testDoc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      testData
    );

    console.log('✅ Schema validation passed');
    
    // Clean up
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      testDoc.$id
    );

    return true;
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    console.log('\n📋 Required attributes for users collection:');
    console.log('- name (string, required)');
    console.log('- email (string, required)');
    console.log('- avatar (string, optional)');
    console.log('- skills (string array, optional)');
    console.log('- tools (string array, optional)');
    console.log('- isAvailable (boolean, optional)');
    console.log('- hasCompletedOnboarding (boolean, optional)');
    return false;
  }
};
