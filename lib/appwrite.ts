import { Account, Client, Databases, ID } from 'react-native-appwrite';

// Appwrite configuration with validation
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || 'com.rishi04.Resourcelyappify',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'resourcely',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'dbandroid',
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || 'users',
};

// Validate configuration in development
if (__DEV__) {
  console.log('Appwrite Configuration:', {
    endpoint: appwriteConfig.endpoint,
    platform: appwriteConfig.platform,
    projectId: appwriteConfig.projectId,
    databaseId: appwriteConfig.databaseId,
  });
}

// Initialize Appwrite client
const client = new Client();

try {
  client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);
} catch (error) {
  console.error('Failed to initialize Appwrite client:', error);
  throw new Error('Appwrite configuration error');
}

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

export { ID };

